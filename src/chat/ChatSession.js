// src/chat/ChatSession.js
import { MistralClient } from '../api/MistralClient.js';
import { FileManager } from '../file/FileManager.js';

export class ChatSession {
  constructor(config, modelConfig, ui, workingDirectory) {
    this.config = config;
    this.modelConfig = modelConfig;
    this.ui = ui;
    this.client = new MistralClient(config);
    this.fileManager = new FileManager(workingDirectory);
    this.isActive = false;
    this.buffer = '';
    this.rawResponse = ''; // Store raw response for file operation parsing
  }

  async start() {
    this.isActive = true;
    this.ui.showChatHeader(this.config.model, this.fileManager.getWorkingDirectory());

    // Show initial file operations help
    this.ui.showFileOperationsHelp();

    while (this.isActive) {
      const question = await this.ui.promptUserInput();

      if (this.shouldExit(question)) {
        this.stop();
        break;
      }

      if (this.isFileCommand(question)) {
        await this.handleFileCommand(question);
        continue;
      }

      await this.handleUserMessage(question);
    }
  }

  isFileCommand(message) {
    return message.startsWith('/') && (
      message.startsWith('/ls') ||
      message.startsWith('/tree') ||
      message.startsWith('/cd') ||
      message.startsWith('/pwd') ||
      message.startsWith('/cat') ||
      message.startsWith('/help')
    );
  }

  async handleFileCommand(command) {
    const [cmd, ...args] = command.split(' ');

    try {
      switch (cmd) {
        case '/ls':
          await this.listFiles(args[0] || '.');
          break;
        case '/tree':
          await this.showFileTree(args[0] || '.');
          break;
        case '/cd':
          await this.changeDirectory(args[0] || '.');
          break;
        case '/pwd':
          this.ui.showCurrentDirectory(this.fileManager.getWorkingDirectory());
          break;
        case '/cat':
          await this.showFileContent(args[0]);
          break;
        case '/help':
          this.ui.showFileOperationsHelp();
          break;
        default:
          this.ui.showError(`Unknown command: ${cmd}`);
      }
    } catch (error) {
      this.ui.showError(`Command failed: ${error.message}`);
    }
  }

  async listFiles(dirpath) {
    const files = await this.fileManager.listFiles(dirpath);
    this.ui.showFileList(files);
  }

  async showFileTree(dirpath) {
    const tree = await this.fileManager.getFileTree(dirpath);
    this.ui.showFileTree(tree);
  }

  async changeDirectory(dirpath) {
    const oldDir = this.fileManager.getWorkingDirectory();
    try {
      this.fileManager.setWorkingDirectory(dirpath);
      const newDir = this.fileManager.getWorkingDirectory();
      this.ui.showDirectoryChange(oldDir, newDir);
    } catch (error) {
      this.ui.showError(`Cannot change directory: ${error.message}`);
    }
  }

  async showFileContent(filepath) {
    if (!filepath) {
      this.ui.showError('Please specify a file to read');
      return;
    }

    try {
      const content = await this.fileManager.readFile(filepath);
      this.ui.showFileContent(filepath, content);
    } catch (error) {
      this.ui.showError(`Cannot read file: ${error.message}`);
    }
  }

  async handleUserMessage(message) {
    this.ui.showAssistantHeader();
    this.ui.openBox();

    // Reset buffers for new message
    this.buffer = '';
    this.rawResponse = '';

    // Add file context to the message if requested
    const enhancedMessage = await this.enhanceMessageWithContext(message);

    try {
      await this.client.sendMessage(enhancedMessage, (data) => {
        this.handleStreamData(data);
      });

      // Process any remaining content in buffer
      this.flushBuffer();

      // Parse and execute file operations
      await this.processFileOperations();

    } catch (error) {
      this.ui.showError(`Failed to get response: ${error.message}`);
    }

    this.ui.closeBox();
  }

  async enhanceMessageWithContext(message) {
    // Check if user wants file context
    if (message.includes('@file:') || message.includes('@tree') || message.includes('@ls')) {
      let contextMessage = message;

      // Add file tree context
      if (message.includes('@tree')) {
        const tree = await this.fileManager.getFileTree();
        const treeString = this.formatFileTreeForAI(tree);
        contextMessage += `\n\n[Current file tree:\n${treeString}]`;
      }

      // Add file list context
      if (message.includes('@ls')) {
        const files = await this.fileManager.listFiles();
        const fileList = files.map(f => `${f.isDirectory ? 'd' : 'f'} ${f.name}`).join('\n');
        contextMessage += `\n\n[Current directory files:\n${fileList}]`;
      }

      // Add specific file content
      const fileMatches = message.match(/@file:([^\s]+)/g);
      if (fileMatches) {
        for (const match of fileMatches) {
          const filepath = match.replace('@file:', '');
          try {
            const content = await this.fileManager.readFile(filepath);
            contextMessage += `\n\n[Content of ${filepath}:\n${content}]`;
          } catch (error) {
            contextMessage += `\n\n[Error reading ${filepath}: ${error.message}]`;
          }
        }
      }

      return contextMessage;
    }

    return message;
  }

  formatFileTreeForAI(tree, indent = '') {
    let result = '';
    for (const item of tree) {
      result += `${indent}${item.isDirectory ? '📁' : '📄'} ${item.name}\n`;
      if (item.children && item.children.length > 0) {
        result += this.formatFileTreeForAI(item.children, indent + '  ');
      }
    }
    return result;
  }

  handleStreamData(data) {
    const content = data.choices[0].delta.content;
    if (!content) return content;

    // Store raw response for file operation parsing
    this.rawResponse += content;

    this.buffer += content;

    // Process complete lines (ending with \n)
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();

    // Process complete lines
    lines.forEach(line => {
      this.displayLine(line);
    });

    // Force flush if buffer is too long
    if (this.buffer.length > this.ui.BOX_WIDTH * 1.5) {
      this.flushBuffer();
    }

    return content;
  }

  async processFileOperations() {
    const operations = this.fileManager.parseFileOperations(this.rawResponse);

    if (operations.length > 0) {
      this.ui.showFileOperationsHeader();
      const results = await this.fileManager.executeOperations(operations, this.ui);

      // Show summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        this.ui.showSuccess(`✅ ${successful} file operation(s) completed successfully`);
      }
      if (failed > 0) {
        this.ui.showError(`❌ ${failed} file operation(s) failed`);
      }
    }
  }

  displayLine(text) {
    // Clean file operation markers from displayed text
    const cleanText = this.fileManager.cleanContent(text);

    if (cleanText.trim() === '') {
      this.ui.printBoxLine('');
      return;
    }

    const wrapped = this.ui.wrapText(cleanText, this.ui.BOX_WIDTH - 4);
    wrapped.forEach(line => this.ui.printBoxLine(line));
  }

  flushBuffer() {
    if (this.buffer.trim()) {
      this.displayLine(this.buffer.trim());
      this.buffer = '';
    }
  }

  shouldExit(input) {
    return ['exit', 'quit', '/exit', '/quit'].includes(input.toLowerCase());
  }

  stop() {
    this.isActive = false;
    this.ui.showGoodbye();
  }
}

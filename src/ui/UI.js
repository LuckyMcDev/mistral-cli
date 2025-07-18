// src/ui/UI.js
import inquirer from 'inquirer';
import chalk from 'chalk';

export class UI {
  constructor() {
    // Set width based on terminal size, min 80 max 200
    this.BOX_WIDTH = process.stdout.columns
      ? Math.min(200, Math.max(80, process.stdout.columns - 4))
      : 120;

    this.useColors = true;
    this.htmlOptions = {
      wordwrap: this.BOX_WIDTH - 4,
      selectors: [
        { selector: 'h1', options: { uppercase: false } },
        { selector: 'h2', options: { uppercase: false } },
        { selector: 'h3', options: { uppercase: false } },
        { selector: 'h4', options: { uppercase: false } },
        { selector: 'h5', options: { uppercase: false } },
        { selector: 'h6', options: { uppercase: false } },
        { selector: 'code', options: { format: 'inline' } },
        { selector: 'pre', options: { format: 'block' } },
        { selector: 'blockquote', options: { format: 'block' } },
        { selector: 'ul', options: { format: 'block' } },
        { selector: 'ol', options: { format: 'block' } },
      ]
    };
  }

  showWelcome() {
    this.showAscii();
  }

  showAscii() {
    console.clear();

    // Enhanced gradient colors
    const gradientColors = [
      chalk.rgb(255, 94, 77),   // Coral red
      chalk.rgb(255, 154, 0),   // Orange
      chalk.rgb(255, 206, 84),  // Yellow
      chalk.rgb(75, 192, 192),  // Teal
      chalk.rgb(54, 162, 235),  // Blue
      chalk.rgb(153, 102, 255), // Purple
    ];

    const lines = [
      '███╗   ███╗██╗███████╗████████╗██████╗  █████╗ ██╗          ██████╗██╗     ██╗',
      '████╗ ████║██║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║         ██╔════╝██║     ██║',
      '██╔████╔██║██║███████╗   ██║   ██████╔╝███████║██║         ██║     ██║     ██║',
      '██║╚██╔╝██║██║╚════██║   ██║   ██╔══██╗██╔══██║██║         ██║     ██║     ██║',
      '██║ ╚═╝ ██║██║███████║   ██║   ██║  ██║██║  ██║███████╗    ╚██████╗███████╗██║',
      '╚═╝     ╚═╝╚═╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝     ╚═════╝╚══════╝╚═╝',
    ];

    lines.forEach((line, i) => {
      console.log(gradientColors[i](line));
    });

    console.log('\n' + chalk.gray('─'.repeat(this.BOX_WIDTH)));
    console.log(chalk.cyan.bold('🤖 AI-Powered CLI with File Operations & HTML Support'));
    console.log(chalk.gray('─'.repeat(this.BOX_WIDTH)) + '\n');
  }

  async showMainMenu() {
    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: chalk.cyan.bold('What would you like to do?'),
      choices: [
        { name: '💬 Start Chatting', value: '💬 Start Chatting' },
        { name: '📁 Set Working Directory', value: '📁 Set Working Directory' },
        { name: '⚙️ Change Model', value: '⚙️ Change Model' },
        { name: '🔑 Set API Key', value: '🔑 Set API Key' },
        { name: '📝 Edit Config File', value: '📝 Edit Config File' },
        { name: '❌ Exit', value: '❌ Exit' },
      ],
      pageSize: 10,
    }]);

    return choice;
  }

  async promptWorkingDirectory() {
    const { directory } = await inquirer.prompt([{
      type: 'input',
      name: 'directory',
      message: chalk.cyan('Enter working directory path:'),
      default: process.cwd(),
      prefix: '📁',
    }]);

    return directory;
  }

  async promptUserInput() {
    const { question } = await inquirer.prompt([{
      type: 'input',
      name: 'question',
      message: chalk.green.bold('You:'),
      prefix: '👤',
    }]);

    return question;
  }

  showChatHeader(model, workingDir) {
    const modelDisplayName = this.getModelDisplayName(model);
    const apiType = this.getApiType(model);

    console.log('\n' + chalk.gray('═'.repeat(this.BOX_WIDTH)));
    console.log(chalk.cyan.bold(`🤖 Model: ${modelDisplayName}`) + chalk.gray(` (${apiType})`));
    console.log(chalk.blue.bold(`📂 Working Directory: `) + chalk.gray(workingDir));
    console.log(chalk.yellow(`💡 Type 'exit' to quit or '/help' for file commands`));
    console.log(chalk.gray('═'.repeat(this.BOX_WIDTH)));
  }

  getModelDisplayName(model) {
    const modelNames = {
      'mistral-small': 'Mistral Small',
      'mistral-medium': 'Mistral Medium',
      'mistral-large': 'Mistral Large',
      'codestral-2501': 'Codestral 2501',
      'codestral-latest': 'Codestral Latest'
    };

    return modelNames[model] || model;
  }

  getApiType(model) {
    return model.startsWith('codestral') ? 'Codestral API' : 'Mistral API';
  }

  showFileOperationsHelp() {
    console.log('\n' + chalk.cyan.bold('📁 File Operations Help:'));
    console.log(chalk.gray('─'.repeat(this.BOX_WIDTH)));

    console.log(chalk.yellow.bold('Commands:'));
    const commands = [
      ['/ls [dir]', 'List files in directory'],
      ['/tree [dir]', 'Show file tree'],
      ['/cd <dir>', 'Change working directory'],
      ['/pwd', 'Show current directory'],
      ['/cat <file>', 'Show file content'],
      ['/help', 'Show this help'],
    ];

    commands.forEach(([cmd, desc]) => {
      console.log(`  ${chalk.green(cmd.padEnd(12))} ${chalk.gray('- ' + desc)}`);
    });

    console.log('\n' + chalk.yellow.bold('Context helpers:'));
    const helpers = [
      ['@tree', 'Include file tree in message'],
      ['@ls', 'Include file list in message'],
      ['@file:path', 'Include file content in message'],
    ];

    helpers.forEach(([helper, desc]) => {
      console.log(`  ${chalk.magenta(helper.padEnd(12))} ${chalk.gray('- ' + desc)}`);
    });

    console.log('\n' + chalk.yellow.bold('AI File Operation Markers:'));
    const markers = [
      ['<FILE_OP:WRITE:path>content</FILE_OP>', 'Write file'],
      ['<FILE_OP:APPEND:path>content</FILE_OP>', 'Append to file'],
      ['<FILE_OP:DELETE:path></FILE_OP>', 'Delete file'],
      ['<DIR_OP:CREATE:path />', 'Create directory'],
    ];

    markers.forEach(([marker, desc]) => {
      console.log(`  ${chalk.blue(marker)} ${chalk.gray('- ' + desc)}`);
    });

    console.log(chalk.gray('─'.repeat(this.BOX_WIDTH)));
  }

  showAssistantHeader() {
    console.log('\n' + chalk.magenta.bold('🤖 Assistant:'));
  }

  openBox() {
    console.log(chalk.magenta(`╭${'─'.repeat(this.BOX_WIDTH)}╮`));
  }

  closeBox() {
    console.log(chalk.magenta(`╰${'─'.repeat(this.BOX_WIDTH)}╯`));
  }

  printBoxLine(line) {
    // Check if line contains HTML
    if (this.containsHTML(line)) {
      this.printHTMLLine(line);
    } else {
      this.printPlainLine(line);
    }
  }

  containsHTML(text) {
    return /<[^>]*>/g.test(text);
  }

  printHTMLLine(htmlLine) {
    try {
      // Convert HTML to styled text
      const styledText = this.convertHTMLToStyledText(htmlLine);
      const lines = styledText.split('\n');

      lines.forEach(line => {
        if (line.trim()) {
          const wrapped = this.wrapText(line, this.BOX_WIDTH - 4);
          wrapped.forEach(wrappedLine => {
            console.log(chalk.magenta(`│  `) + chalk.whiteBright(wrappedLine) + chalk.magenta('  │'));
          });
        } else {
          console.log(chalk.magenta(`│  `) + ' '.repeat(this.BOX_WIDTH - 4) + chalk.magenta('  │'));
        }
      });
    } catch (error) {
      // Fallback to plain text if HTML parsing fails
      this.printPlainLine(htmlLine);
    }
  }

  convertHTMLToStyledText(html) {
    // Enhanced HTML to styled text conversion
    let text = html;

    // Headers
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (match, content) =>
      chalk.red.bold.underline(content.toUpperCase()));
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, content) =>
      chalk.yellow.bold(content));
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (match, content) =>
      chalk.green.bold(content));
    text = text.replace(/<h[4-6][^>]*>(.*?)<\/h[4-6]>/gi, (match, content) =>
      chalk.cyan.bold(content));

    // Text formatting
    text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, (match, content) =>
      chalk.bold(content));
    text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, (match, content) =>
      chalk.bold(content));
    text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, (match, content) =>
      chalk.italic(content));
    text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, (match, content) =>
      chalk.italic(content));
    text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, (match, content) =>
      chalk.underline(content));

    // Code
    text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, (match, content) =>
      chalk.bgGray.white(` ${content} `));
    text = text.replace(/<pre[^>]*>(.*?)<\/pre>/gi, (match, content) =>
      chalk.bgBlack.green(content));

    // Links
    text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, url, content) =>
      chalk.blue.underline(content) + chalk.gray(` (${url})`));

    // Lists
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) =>
      `  • ${content}`);
    text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) =>
      content);
    text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) =>
      content);

    // Blockquotes
    text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (match, content) =>
      chalk.gray('│ ') + chalk.italic(content));

    // Paragraphs and line breaks
    text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, (match, content) =>
      content + '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // Remove remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&apos;/g, "'");

    return text;
  }

  printPlainLine(line) {
    const padded = line.padEnd(this.BOX_WIDTH - 2, ' ');
    console.log(chalk.magenta(`│ `) + chalk.whiteBright(padded) + chalk.magenta(' │'));
  }

  stripAnsiCodes(text) {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  showFileOperationsHeader() {
    console.log('\n' + chalk.yellow.bold('📝 File Operations:'));
    console.log(chalk.gray('─'.repeat(this.BOX_WIDTH)));
  }

  showFileOperation(icon, operation, filepath) {
    const operationColors = {
      'WRITE': chalk.green,
      'APPEND': chalk.yellow,
      'DELETE': chalk.red,
      'READ': chalk.cyan,
      'MKDIR': chalk.blue,
      'RMDIR': chalk.red,
    };

    const coloredOp = operationColors[operation]
      ? operationColors[operation](operation)
      : operation;

    console.log(`${chalk.green(icon)} ${coloredOp} ${chalk.gray(filepath)}`);
  }

  showFileList(files) {
    console.log('\n' + chalk.cyan.bold('📁 Files:'));
    console.log(chalk.gray('─'.repeat(this.BOX_WIDTH)));

    files.forEach(file => {
      const icon = file.isDirectory ? '📁' : '📄';
      const size = file.isDirectory ? '' : chalk.dim(` (${this.formatFileSize(file.size)})`);
      const name = file.isDirectory ? chalk.cyan.bold(file.name) : chalk.whiteBright(file.name);
      console.log(`${icon} ${name}${size}`);
    });
  }

  showFileTree(tree, indent = '') {
    console.log('\n' + chalk.cyan.bold('🌳 File Tree:'));
    console.log(chalk.gray('─'.repeat(this.BOX_WIDTH)));
    this.printFileTree(tree, '');
  }

  printFileTree(tree, indent) {
    tree.forEach((item, index) => {
      const isLast = index === tree.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = item.isDirectory ? '📁' : '📄';
      const name = item.isDirectory ? chalk.cyan.bold(item.name) : chalk.whiteBright(item.name);

      console.log(`${chalk.gray(indent)}${chalk.gray(connector)}${icon} ${name}`);

      if (item.children && item.children.length > 0) {
        const newIndent = indent + (isLast ? '    ' : '│   ');
        this.printFileTree(item.children, newIndent);
      }
    });
  }

  showFileContent(filepath, content) {
    console.log('\n' + chalk.cyan.bold(`📄 Content of ${filepath}:`));
    console.log(chalk.gray('─'.repeat(this.BOX_WIDTH)));

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = chalk.gray(String(index + 1).padStart(3, ' '));
      console.log(`${lineNum} ${chalk.gray(' │')} ${chalk.whiteBright(line)}`);
    });
  }

  showCurrentDirectory(dir) {
    console.log('\n' + chalk.cyan.bold(`📍 Current Directory: `) + chalk.whiteBright(dir));
  }

  showDirectoryChange(oldDir, newDir) {
    console.log('\n' + chalk.cyan.bold(`📂 Directory changed:`));
    console.log(chalk.gray(`From: ${oldDir}`));
    console.log(chalk.green(`To:   ${newDir}`));
  }

  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  }

  wrapText(text, maxWidth) {
    if (!text) return [''];

    const lines = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }

      // Handle text with ANSI codes
      const cleanText = this.stripAnsiCodes(paragraph);
      const words = paragraph.split(' ');
      let currentLine = '';
      let currentCleanLength = 0;

      for (const word of words) {
        const cleanWord = this.stripAnsiCodes(word);
        const testCleanLength = currentCleanLength + (currentCleanLength > 0 ? 1 : 0) + cleanWord.length;

        if (testCleanLength <= maxWidth) {
          currentLine = currentLine ? `${currentLine} ${word}` : word;
          currentCleanLength = testCleanLength;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
            currentCleanLength = cleanWord.length;
          } else {
            // Word is too long, split it
            lines.push(word.substring(0, maxWidth));
            currentLine = word.substring(maxWidth);
            currentCleanLength = this.stripAnsiCodes(currentLine).length;
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines.length > 0 ? lines : [''];
  }

  showGoodbye() {
    console.log('\n' + chalk.magenta.bold('═'.repeat(this.BOX_WIDTH)));
    console.log(chalk.cyan.bold('🚀 Thank you for using Mistral CLI!'));
    console.log(chalk.gray('Come back anytime for more AI assistance.'));
    console.log(chalk.magenta.bold('═'.repeat(this.BOX_WIDTH)) + '\n');
  }

  showError(message) {
    console.error(chalk.red.bold(`❌ Error: `) + chalk.red(message));
  }

  showSuccess(message) {
    console.log(chalk.green.bold('✅ ') + chalk.green(message));
  }
}

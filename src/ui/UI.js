// src/ui/UI.js
import inquirer from 'inquirer';
import { bold, green, blue, cyan, gray, yellow, red, magenta } from 'colorette';
import { relative } from 'node:path';

export class UI {
  constructor() {
    this.BOX_WIDTH = 60;
  }

  showWelcome() {
    this.showAscii();
  }

  showAscii() {
    const rgbColors = [
      [255, 140, 0],
      [255, 110, 0],
      [255, 80, 0],
      [255, 50, 0],
      [255, 30, 0],
      [200, 20, 0],
    ];

    const reset = '\x1b[0m';
    const colorLine = (line, [r, g, b]) => `\x1b[38;2;${r};${g};${b}m${line}${reset}`;

    const lines = [
      '███╗   ███╗██╗███████╗████████╗██████╗  █████╗ ██╗          ██████╗██╗     ██╗',
      '████╗ ████║██║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║         ██╔════╝██║     ██║',
      '██╔████╔██║██║███████╗   ██║   ██████╔╝███████║██║         ██║     ██║     ██║',
      '██║╚██╔╝██║██║╚════██║   ██║   ██╔══██╗██╔══██║██║         ██║     ██║     ██║',
      '██║ ╚═╝ ██║██║███████║   ██║   ██║  ██║██║  ██║███████╗    ╚██████╗███████╗██║',
      '╚═╝     ╚═╝╚═╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝     ╚═════╝╚══════╝╚═╝',
    ];

    lines.forEach((line, i) => {
      console.log(bold(colorLine(line, rgbColors[i])));
    });
  }

  async showMainMenu() {
    console.clear();
    console.log(bold(cyan('=== Mistral CLI Main Menu ===\n')));

    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'What do you want to do?',
      choices: [
        '💬 Start Chatting',
        '📁 Set Working Directory',
        '⚙️ Change Model',
        '🔑 Set API Key',
        '📝 Edit Config File',
        '❌ Exit',
      ],
    }]);

    return choice;
  }

  async promptWorkingDirectory() {
    const { directory } = await inquirer.prompt([{
      type: 'input',
      name: 'directory',
      message: 'Enter working directory path:',
      default: process.cwd(),
    }]);

    return directory;
  }

  async promptUserInput() {
    const { question } = await inquirer.prompt([{
      type: 'input',
      name: 'question',
      message: bold(green('You:')),
      prefix: '',
    }]);

    return question;
  }

  showChatHeader(model, workingDir) {
    console.log(gray(`Model: ${model}`));
    console.log(gray(`Working Directory: ${workingDir}`));
    console.log(gray("Type 'exit' to quit or '/help' for file commands."));
    console.log(gray('─'.repeat(this.BOX_WIDTH)));
  }

  showFileOperationsHelp() {
    console.log(bold(cyan('\n📁 File Operations Help:')));
    console.log(gray('Commands:'));
    console.log(gray('  /ls [dir]     - List files in directory'));
    console.log(gray('  /tree [dir]   - Show file tree'));
    console.log(gray('  /cd <dir>     - Change working directory'));
    console.log(gray('  /pwd          - Show current directory'));
    console.log(gray('  /cat <file>   - Show file content'));
    console.log(gray('  /help         - Show this help'));
    console.log(gray('\nContext helpers:'));
    console.log(gray('  @tree         - Include file tree in message'));
    console.log(gray('  @ls           - Include file list in message'));
    console.log(gray('  @file:path    - Include file content in message'));
    console.log(gray('\nAI File Operation Markers:'));
    console.log(gray('  <FILE_OP:WRITE:path>content</FILE_OP>    - Write file'));
    console.log(gray('  <FILE_OP:APPEND:path>content</FILE_OP>   - Append to file'));
    console.log(gray('  <FILE_OP:DELETE:path></FILE_OP>         - Delete file'));
    console.log(gray('  <DIR_OP:CREATE:path />                  - Create directory'));
    console.log(gray('─'.repeat(this.BOX_WIDTH)));
  }

  showAssistantHeader() {
    console.log(bold(blue('Mistral 🤖:')));
  }

  openBox() {
    console.log(bold(blue(`╭${'─'.repeat(this.BOX_WIDTH)}╮`)));
  }

  closeBox() {
    console.log(bold(blue(`╰${'─'.repeat(this.BOX_WIDTH)}╯`)));
  }

  printBoxLine(line) {
    const padded = line.padEnd(this.BOX_WIDTH - 4, ' ');
    console.log(blue(`│ ${cyan(padded)} │`));
  }

  showFileOperationsHeader() {
    console.log(bold(magenta('\n📝 File Operations:')));
    console.log(gray('─'.repeat(30)));
  }

  showFileOperation(icon, operation, filepath) {
    const coloredOp = operation === 'WRITE' ? green(operation) :
      operation === 'APPEND' ? yellow(operation) :
        operation === 'DELETE' ? red(operation) :
          operation === 'READ' ? cyan(operation) :
            operation === 'MKDIR' ? blue(operation) :
              operation === 'RMDIR' ? red(operation) :
                operation;

    console.log(`${icon} ${coloredOp} ${gray(filepath)}`);
  }

  showFileList(files) {
    console.log(bold(cyan('\n📁 Files:')));
    console.log(gray('─'.repeat(30)));

    files.forEach(file => {
      const icon = file.isDirectory ? '📁' : '📄';
      const size = file.isDirectory ? '' : ` (${this.formatFileSize(file.size)})`;
      const color = file.isDirectory ? cyan : gray;
      console.log(`${icon} ${color(file.name)}${size}`);
    });
  }

  showFileTree(tree, indent = '') {
    console.log(bold(cyan('\n🌳 File Tree:')));
    console.log(gray('─'.repeat(30)));
    this.printFileTree(tree, '');
  }

  printFileTree(tree, indent) {
    tree.forEach((item, index) => {
      const isLast = index === tree.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = item.isDirectory ? '📁' : '📄';
      const color = item.isDirectory ? cyan : gray;

      console.log(`${indent}${connector}${icon} ${color(item.name)}`);

      if (item.children && item.children.length > 0) {
        const newIndent = indent + (isLast ? '    ' : '│   ');
        this.printFileTree(item.children, newIndent);
      }
    });
  }

  showFileContent(filepath, content) {
    console.log(bold(cyan(`\n📄 Content of ${filepath}:`)));
    console.log(gray('─'.repeat(50)));

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = String(index + 1).padStart(3, ' ');
      console.log(`${gray(lineNum)} │ ${line}`);
    });
  }

  showCurrentDirectory(dir) {
    console.log(bold(cyan(`\n📍 Current Directory: ${dir}`)));
  }

  showDirectoryChange(oldDir, newDir) {
    console.log(bold(cyan(`\n📂 Directory changed:`)));
    console.log(gray(`From: ${oldDir}`));
    console.log(gray(`To:   ${newDir}`));
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

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word.substring(0, maxWidth));
            currentLine = word.substring(maxWidth);
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
    console.log(bold(blue('\nGoodbye!')));
  }

  showError(message) {
    console.error(red(`❌ Error: ${message}`));
  }

  showSuccess(message) {
    console.log(green(message));
  }
}

// src/ui/UI.js
import inquirer from 'inquirer';
import { bold, green, blue, cyan, gray } from 'colorette';

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
        '⚙️ Change Model',
        '🔑 Set API Key',
        '📝 Edit Config File',
        '❌ Exit',
      ],
    }]);

    return choice;
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

  showChatHeader(model) {
    console.log(gray(`Model: ${model}`));
    console.log(gray("Type 'exit' to quit."));
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
        // Check if adding this word would exceed the width
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length <= maxWidth) {
          currentLine = testLine;
        } else {
          // If current line has content, push it and start new line
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, force break it
            lines.push(word.substring(0, maxWidth));
            currentLine = word.substring(maxWidth);
          }
        }
      }

      // Add any remaining content
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
    console.error(`Error: ${message}`);
  }
}

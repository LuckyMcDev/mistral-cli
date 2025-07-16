import inquirer from 'inquirer';
import Mistral from '../lib/Mistral.js';
import { bold, green, blue, cyan, gray } from 'colorette';

const BOX_WIDTH = 60;

function wrapText(text, width) {
  const lines = [];
  let current = '';
  for (const word of text.split(' ')) {
    if ((current + word).length > width) {
      lines.push(current.trimEnd());
      current = '';
    }
    current += word + ' ';
  }
  if (current) lines.push(current.trimEnd());
  return lines;
}

function openBox() {
  console.log(bold(blue(`╭${'─'.repeat(BOX_WIDTH)}╮`)));
}

function closeBox() {
  console.log(bold(blue(`╰${'─'.repeat(BOX_WIDTH)}╯`)));
}

function printBoxLine(line) {
  const padded = line.padEnd(BOX_WIDTH, ' ');
  console.log(blue(`│ ${cyan(padded)} │`));
}

function printAssistantHeader() {
  console.log(bold(blue('Mistral 🤖:')));
}

export async function startChat(config) {
  const mistral = new Mistral(config);
  console.log(gray(`Model: ${config.model}`));
  console.log(gray("Type 'exit' to quit."));
  console.log(gray('─'.repeat(BOX_WIDTH)));

  while (true) {
    const { question } = await inquirer.prompt([{
      type: 'input',
      name: 'question',
      message: bold(green('You:')),
      prefix: '',
    }]);

    if (['exit', 'quit'].includes(question.toLowerCase())) {
      console.log(bold(blue('\nGoodbye!')));
      break;
    }

    printAssistantHeader();
    openBox();

    let currentLine = '';
    await mistral.sendQuestion(question, (data) => {
      const content = data.choices[0].delta.content;
      if (!content) return;

      for (const char of content) {
        currentLine += char;
        if (currentLine.length >= BOX_WIDTH || char === '\n') {
          const wrapped = wrapText(currentLine.trim(), BOX_WIDTH);
          for (const line of wrapped) printBoxLine(line);
          currentLine = '';
        }
      }
    });

    if (currentLine.trim()) {
      const wrapped = wrapText(currentLine.trim(), BOX_WIDTH);
      for (const line of wrapped) printBoxLine(line);
    }

    closeBox();
  }
}

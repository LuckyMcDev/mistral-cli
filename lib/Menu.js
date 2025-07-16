import inquirer from 'inquirer';
import { bold, cyan } from 'colorette';

export async function mainMenu() {
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

import path from 'node:path';
import { homedir } from 'node:os';
import { mainMenu } from './lib/menu.js';
import { startChat } from './lib/chat.js';
import { showAscii } from './lib/ascii.js';
import { ConfigManager } from './lib/configManager.js';

const CONFIGURATION_FOLDER = path.join(homedir(), '/.config/mistral-cli');
const CONFIGURATION_PATH = path.join(CONFIGURATION_FOLDER, 'conf.json');

async function run() {
  const configManager = new ConfigManager(CONFIGURATION_PATH);
  await configManager.load();

  if (configManager.config.secretKey === 'YOUR API KEY') {
    console.error('Please set your API key first.');
    await configManager.promptSetApiKey();
  }

  showAscii();

  while (true) {
    const choice = await mainMenu();

    switch (choice) {
      case '💬 Start Chatting':
        await startChat(configManager.config);
        break;
      case '⚙️ Change Model':
        await configManager.promptChangeModel();
        break;
      case '🔑 Set API Key':
        await configManager.promptSetApiKey();
        break;
      case '📝 Edit Config File':
        await configManager.openConfigFile();
        break;
      case '❌ Exit':
        console.log('Goodbye!');
        process.exit(0);
        break;
      default:
        console.log('Unknown choice');
    }
  }
}

run();

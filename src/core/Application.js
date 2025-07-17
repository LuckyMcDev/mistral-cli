// src/core/Application.js
import path from 'node:path';
import { ConfigManager } from '../config/ConfigManager.js';
import { ModelConfigManager } from '../config/ModelConfigManager.js';
import { UI } from '../ui/UI.js';
import { ChatSession } from '../chat/ChatSession.js';

export class Application {
  constructor(configFolder) {
    this.configFolder = configFolder;
    this.configPath = path.join(configFolder, 'conf.json');
    this.modelsFolder = path.join(configFolder, 'models');
    this.workingDirectory = process.cwd();

    this.configManager = new ConfigManager(this.configPath);
    this.modelConfigManager = new ModelConfigManager(this.modelsFolder);
    this.ui = new UI();
    this.chatSession = null;
  }

  async run() {
    // Initialize configuration
    await this.configManager.load();
    await this.modelConfigManager.initDefaults();

    // Show welcome screen
    this.ui.showWelcome();

    // Main application loop
    while (true) {
      const choice = await this.ui.showMainMenu();

      if (!(await this.handleMenuChoice(choice))) {
        break;
      }
    }
  }

  async handleMenuChoice(choice) {
    switch (choice) {
      case '💬 Start Chatting':
        await this.startChatSession();
        break;
      case '📁 Set Working Directory':
        await this.setWorkingDirectory();
        break;
      case '⚙️ Change Model':
        await this.changeModel();
        break;
      case '🔑 Set API Key':
        await this.setApiKey();
        break;
      case '📝 Edit Config File':
        await this.editConfig();
        break;
      case '❌ Exit':
        this.ui.showGoodbye();
        return false;
      default:
        this.ui.showError('Unknown choice');
    }
    return true;
  }

  async startChatSession() {
    const config = this.configManager.getConfig();
    const modelConfig = await this.modelConfigManager.load(config.model);

    this.chatSession = new ChatSession(config, modelConfig, this.ui, this.workingDirectory);
    await this.chatSession.start();
  }

  async setWorkingDirectory() {
    try {
      const newDir = await this.ui.promptWorkingDirectory();
      const { access } = await import('node:fs/promises');

      // Check if directory exists
      await access(newDir);

      const { resolve } = await import('node:path');
      this.workingDirectory = resolve(newDir);

      this.ui.showSuccess(`✅ Working directory set to: ${this.workingDirectory}`);
    } catch (error) {
      this.ui.showError(`Invalid directory: ${error.message}`);
    }
  }

  async changeModel() {
    await this.configManager.promptChangeModel();
  }

  async setApiKey() {
    await this.configManager.promptSetApiKey();
  }

  async editConfig() {
    this.configManager.showConfigPath();
  }
}

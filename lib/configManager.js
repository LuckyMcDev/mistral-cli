import inquirer from 'inquirer';
import { readConfiguration, writeConfiguration } from './config.js';

export class ConfigManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.config = null;
  }

  async load() {
    this.config = await readConfiguration(this.filePath);
    return this.config;
  }

  async save() {
    await writeConfiguration(this.filePath, this.config);
  }

  async promptSetApiKey() {
    const { key } = await inquirer.prompt([{
      type: 'input',
      name: 'key',
      message: 'Enter your Mistral API Key:',
      validate: (input) => input.length > 0 || 'API Key cannot be empty',
    }]);
    this.config.secretKey = key;
    await this.save();
    console.log('API Key saved successfully.');
  }

  async promptChangeModel() {
    const models = ['mistral-small', 'mistral-medium', 'mistral-large'];
    const { model } = await inquirer.prompt([{
      type: 'list',
      name: 'model',
      message: 'Select the model to use:',
      choices: models,
      default: this.config.model,
    }]);
    this.config.model = model;
    await this.save();
    console.log(`Model changed to ${model} and saved.`);
  }

  async openConfigFile() {
    // Just print path for now, user can edit manually
    console.log(`Please edit your config file here:\n${this.filePath}`);
  }
}

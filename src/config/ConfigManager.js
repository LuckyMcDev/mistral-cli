// src/config/ConfigManager.js
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import inquirer from 'inquirer';

export class ConfigManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.config = null;
  }

  async load() {
    try {
      const json = await readFile(this.filePath, 'utf8');
      this.config = JSON.parse(json);
    } catch {
      await this.createDefaultConfig();
    }
    return this.config;
  }

  async createDefaultConfig() {
    const defaultConfig = {
      secretKey: 'YOUR API KEY',
      prePrompt: 'You are an expert programmer and coding assistant...',
      model: 'mistral-small',
    };

    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(defaultConfig, null, 2));

    console.log(`Default config created at ${this.filePath}`);
    console.log('Please set your API key before continuing.');
    process.exit(1);
  }

  async save() {
    await writeFile(this.filePath, JSON.stringify(this.config, null, 2));
  }

  getConfig() {
    return this.config;
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
    const models = ['mistral-small', 'mistral-medium'];
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

  showConfigPath() {
    console.log(`Please edit your config file here:\n${this.filePath}`);
  }
}

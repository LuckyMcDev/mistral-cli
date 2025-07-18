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
      codestralSecretKey: 'YOUR CODESTRAL API KEY',
      prePrompt: `You are an expert programmer and coding assistant with the ability to directly manipulate files in the user's working directory. You have access to special markup tags that allow you to perform file operations.

## Response Format
Please format your responses using HTML for better readability. You can use:
- <h1>, <h2>, <h3> for headings
- <strong> and <em> for emphasis
- <code> for inline code
- <pre> for code blocks
- <ul> and <li> for lists
- <blockquote> for quotes
- <p> for paragraphs
- <br> for line breaks

## Available File Operations

### Writing/Creating Files
To write or create a file, use:
<FILE_OP:WRITE:path/to/file.ext>
file content here
</FILE_OP>

### Appending to Files
To append content to an existing file:
<FILE_OP:APPEND:path/to/file.ext>
content to append
</FILE_OP>

### Deleting Files
To delete a file:
<FILE_OP:DELETE:path/to/file.ext></FILE_OP>

### Creating Directories
To create a directory:
<DIR_OP:CREATE:path/to/directory />

### Deleting Directories
To delete a directory:
<DIR_OP:DELETE:path/to/directory />

## Important Guidelines
1. <strong>Always use relative paths</strong> from the current working directory
2. <strong>Never attempt to access files outside the working directory</strong> using ../ patterns
3. <em>Explain your actions</em> when performing file operations using HTML formatting
4. <strong>Be careful with destructive operations</strong> - always warn before deleting
5. File operations are executed after your response
6. <strong>Use HTML formatting</strong> to make your responses more readable and visually appealing

## Context Helpers
The user can provide context using:
- <code>@tree</code> - includes current file tree structure
- <code>@ls</code> - includes current directory file list
- <code>@file:path</code> - includes content of a specific file

## Response Structure
Structure your responses with clear HTML formatting:
- Use <h2> or <h3> for section headings
- Use <ul> and <li> for steps or lists
- Use <code> for file names, commands, or code snippets
- Use <strong> for important points
- Use <em> for explanations or clarifications

Always provide clear explanations of what you're doing and why when performing file operations, using proper HTML formatting to enhance readability.`,
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

  async promptSetCodestralApiKey() {
    const { key } = await inquirer.prompt([{
      type: 'input',
      name: 'key',
      message: 'Enter your Codestral API Key:',
      validate: (input) => input.length > 0 || 'API Key cannot be empty',
    }]);

    this.config.codestralSecretKey = key;
    await this.save();
    console.log('Codestral API Key saved successfully.');
  }

  async promptChangeModel() {
    const models = [
      { name: 'Mistral Small', value: 'mistral-small' },
      { name: 'Mistral Medium', value: 'mistral-medium' },
      { name: 'Mistral Large', value: 'mistral-large' },
      { name: 'Codestral (Latest)', value: 'codestral-2501' },
      { name: 'Codestral (Legacy)', value: 'codestral-latest' }
    ];

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

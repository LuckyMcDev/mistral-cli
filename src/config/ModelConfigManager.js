// src/config/ModelConfigManager.js
import path from 'node:path';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import yaml from 'js-yaml';

export class ModelConfigManager {
  constructor(modelsFolder) {
    this.modelsFolder = modelsFolder;
    this.defaultConfigs = {
      'mistral-small': {
        temperature: 0.7,
        max_tokens: 512,
        top_p: 0.9,
      },
      'mistral-medium': {
        temperature: 0.6,
        max_tokens: 1024,
        top_p: 0.95,
      },
      'mistral-large': {
        temperature: 0.5,
        max_tokens: 2048,
        top_p: 0.9,
      },
      'codestral-2501': {
        temperature: 0.3,
        max_tokens: 4096,
        top_p: 0.9,
      },
      'codestral-latest': {
        temperature: 0.3,
        max_tokens: 4096,
        top_p: 0.9,
      },
    };
  }

  getModelConfigPath(modelName) {
    return path.join(this.modelsFolder, `${modelName}.yaml`);
  }

  async initDefaults() {
    await mkdir(this.modelsFolder, { recursive: true });

    for (const [modelName, config] of Object.entries(this.defaultConfigs)) {
      const filePath = this.getModelConfigPath(modelName);

      try {
        await access(filePath);
        // File exists, skip writing default
      } catch {
        // File does not exist, write default
        await this.save(modelName, config);
      }
    }
  }

  async load(modelName) {
    const filePath = this.getModelConfigPath(modelName);

    try {
      const fileContents = await readFile(filePath, 'utf8');
      return yaml.load(fileContents) || {};
    } catch {
      // If file does not exist or cannot be read, return empty object
      return {};
    }
  }

  async save(modelName, configObj) {
    const filePath = this.getModelConfigPath(modelName);
    await mkdir(this.modelsFolder, { recursive: true });

    const yamlStr = yaml.dump(configObj);
    await writeFile(filePath, yamlStr, 'utf8');
  }

  getDefaultConfig(modelName) {
    return this.defaultConfigs[modelName] || {};
  }
}

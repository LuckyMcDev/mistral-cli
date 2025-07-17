#!/usr/bin/env node

// src/index.js
import path from 'node:path';
import { homedir } from 'node:os';
import { Application } from './core/Application.js';

const CONFIG_FOLDER = path.join(homedir(), '/.config/mistral-cli');

async function main() {
  try {
    const app = new Application(CONFIG_FOLDER);
    await app.run();
  } catch (error) {
    console.error('Application error:', error);
    process.exit(1);
  }
}

main();

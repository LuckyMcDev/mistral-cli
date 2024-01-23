#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

import { homedir } from 'node:os';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { magenta, cyan } from 'colorette';
import inquirer from 'inquirer';
import Mistral from '../lib/Mistral.js';

const DEFAULT_CONF = {
  secretKey: 'YOUR API KEY',
  prePrompt: 'Be a helpful assistant',
  model: 'mistral-small',
};

const CONF_FOLDER = path.join(homedir(), '/.config/mistral-cli');
const CONF_PATH = path.join(CONF_FOLDER, 'conf.json');

const readConf = async () => {
  try {
    const json = JSON.parse(await readFile(CONF_PATH, { encoding: 'utf8' }));

    return json;
  } catch (err) {
    // console.debug('No conf file', err);

    await mkdir(CONF_FOLDER, { recursive: true });
    await writeFile(CONF_PATH, JSON.stringify(DEFAULT_CONF, null, 2));
    console.log(`No configuration file. Please run \n> ${magenta(`${process.env.EDITOR || 'nano'} ${CONF_PATH}`)}`);

    process.exit(1);
  }

  return null;
};

(async () => {
  const conf = {
    ...DEFAULT_CONF,
    ...await readConf(),
  };

  const mistral = new Mistral(conf);

  const handleData = (data) => {
    process.stdout.write(cyan(data.choices[0].delta.content));
  };

  const initialQuestion = process.argv.slice(2).join(' ');

  if (initialQuestion) {
    await mistral.send(initialQuestion, handleData);
    process.stdout.write('\n\n');
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { question } = await inquirer.prompt([{
      type: 'input',
      name: 'question',
      message: '>',
    }]);

    await mistral.send(question, handleData);
    process.stdout.write('\n\n');
  }
})();

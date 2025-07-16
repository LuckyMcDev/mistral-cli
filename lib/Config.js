import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function readConfiguration(filePath) {
  try {
    const json = await readFile(filePath, 'utf8');
    return JSON.parse(json);
  } catch {
    const defaultConf = {
      secretKey: 'YOUR API KEY',
      prePrompt: 'You are an expert programmer and coding assistant...',
      model: 'mistral-small',
    };
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(defaultConf, null, 2));
    console.log(`Default config created at ${filePath}`);
    process.exit(1);
  }
}

export async function writeConfiguration(filePath, config) {
  await writeFile(filePath, JSON.stringify(config, null, 2));
}

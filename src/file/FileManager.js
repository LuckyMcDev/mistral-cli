// src/file/FileManager.js
import { readFile, writeFile, mkdir, access, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { bold, green, yellow, red, cyan } from 'colorette';

export class FileManager {
  constructor(workingDirectory = process.cwd()) {
    this.workingDirectory = workingDirectory;
    this.fileOperations = [];
  }

  // Parse AI response for file operation markers
  parseFileOperations(content) {
    const operations = [];

    // Pattern for file operations: <FILE_OP:operation:filepath>content</FILE_OP>
    const fileOpRegex = /<FILE_OP:(CREATE|WRITE|APPEND|DELETE|READ):([^>]+)>([\s\S]*?)<\/FILE_OP>/g;
    let match;

    while ((match = fileOpRegex.exec(content)) !== null) {
      const [fullMatch, operation, filepath, fileContent] = match;
      operations.push({
        operation: operation.toLowerCase(),
        filepath: filepath.trim(),
        content: fileContent,
        originalMatch: fullMatch
      });
    }

    // Pattern for directory operations: <DIR_OP:operation:dirpath />
    const dirOpRegex = /<DIR_OP:(CREATE|DELETE):([^>]+)\s*\/>/g;
    while ((match = dirOpRegex.exec(content)) !== null) {
      const [fullMatch, operation, dirpath] = match;
      operations.push({
        operation: operation.toLowerCase() + '_dir',
        filepath: dirpath.trim(),
        content: '',
        originalMatch: fullMatch
      });
    }

    return operations;
  }

  // Remove file operation markers from content for display
  cleanContent(content) {
    return content
      .replace(/<FILE_OP:(CREATE|WRITE|APPEND|DELETE|READ):([^>]+)>[\s\S]*?<\/FILE_OP>/g, '')
      .replace(/<DIR_OP:(CREATE|DELETE):([^>]+)\s*\/>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up extra newlines
      .trim();
  }

  // Execute file operations
  async executeOperations(operations, ui) {
    const results = [];

    for (const op of operations) {
      try {
        const result = await this.executeOperation(op, ui);
        results.push(result);
      } catch (error) {
        const errorMsg = `Failed to ${op.operation} ${op.filepath}: ${error.message}`;
        ui.showError(errorMsg);
        results.push({ success: false, operation: op.operation, filepath: op.filepath, error: errorMsg });
      }
    }

    return results;
  }

  async executeOperation(op, ui) {
    const fullPath = resolve(this.workingDirectory, op.filepath);
    const relativePath = relative(this.workingDirectory, fullPath);

    // Security check - prevent operations outside working directory
    if (relativePath.startsWith('..')) {
      throw new Error('Operation outside working directory not allowed');
    }

    switch (op.operation) {
      case 'create':
      case 'write':
        await this.writeFile(fullPath, op.content);
        ui.showFileOperation('✓', 'WRITE', relativePath);
        return { success: true, operation: 'write', filepath: relativePath };

      case 'append':
        await this.appendFile(fullPath, op.content);
        ui.showFileOperation('✓', 'APPEND', relativePath);
        return { success: true, operation: 'append', filepath: relativePath };

      case 'delete':
        await this.deleteFile(fullPath);
        ui.showFileOperation('✓', 'DELETE', relativePath);
        return { success: true, operation: 'delete', filepath: relativePath };

      case 'read':
        const content = await this.readFile(fullPath);
        ui.showFileOperation('✓', 'READ', relativePath);
        return { success: true, operation: 'read', filepath: relativePath, content };

      case 'create_dir':
        await this.createDirectory(fullPath);
        ui.showFileOperation('✓', 'MKDIR', relativePath);
        return { success: true, operation: 'mkdir', filepath: relativePath };

      case 'delete_dir':
        await this.deleteDirectory(fullPath);
        ui.showFileOperation('✓', 'RMDIR', relativePath);
        return { success: true, operation: 'rmdir', filepath: relativePath };

      default:
        throw new Error(`Unknown operation: ${op.operation}`);
    }
  }

  async writeFile(filepath, content) {
    await mkdir(dirname(filepath), { recursive: true });
    await writeFile(filepath, content, 'utf8');
  }

  async appendFile(filepath, content) {
    try {
      const existing = await readFile(filepath, 'utf8');
      await writeFile(filepath, existing + content, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.writeFile(filepath, content);
      } else {
        throw error;
      }
    }
  }

  async readFile(filepath) {
    return await readFile(filepath, 'utf8');
  }

  async deleteFile(filepath) {
    const { unlink } = await import('node:fs/promises');
    await unlink(filepath);
  }

  async createDirectory(dirpath) {
    await mkdir(dirpath, { recursive: true });
  }

  async deleteDirectory(dirpath) {
    const { rmdir } = await import('node:fs/promises');
    await rmdir(dirpath, { recursive: true });
  }

  // List files in working directory
  async listFiles(dirpath = '.') {
    const fullPath = resolve(this.workingDirectory, dirpath);
    const files = await readdir(fullPath);
    const fileStats = [];

    for (const file of files) {
      const filePath = join(fullPath, file);
      const stats = await stat(filePath);
      fileStats.push({
        name: file,
        path: relative(this.workingDirectory, filePath),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime
      });
    }

    return fileStats;
  }

  // Get file tree structure
  async getFileTree(dirpath = '.', maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return [];  // Fixed: Added brackets and proper return

    const fullPath = resolve(this.workingDirectory, dirpath);
    const files = await readdir(fullPath);
    const tree = [];

    for (const file of files) {
      if (file.startsWith('.')) continue;

      const filePath = join(fullPath, file);
      const stats = await stat(filePath);
      const relativePath = relative(this.workingDirectory, filePath);

      if (stats.isDirectory()) {
        const children = await this.getFileTree(relativePath, maxDepth, currentDepth + 1);
        tree.push({
          name: file,
          path: relativePath,
          isDirectory: true,
          children
        });
      } else {
        tree.push({
          name: file,
          path: relativePath,
          isDirectory: false
        });
      }
    }

    return tree;
  }

  setWorkingDirectory(newDir) {
    this.workingDirectory = resolve(newDir);
  }

  getWorkingDirectory() {
    return this.workingDirectory;
  }
}

// src/chat/ChatSession.js
import { MistralClient } from '../api/MistralClient.js';

export class ChatSession {
  constructor(config, modelConfig, ui) {
    this.config = config;
    this.modelConfig = modelConfig;
    this.ui = ui;
    this.client = new MistralClient(config);
    this.isActive = false;
    this.buffer = ''; // Changed from currentLine to buffer for clarity
  }

  async start() {
    this.isActive = true;
    this.ui.showChatHeader(this.config.model);

    while (this.isActive) {
      const question = await this.ui.promptUserInput();

      if (this.shouldExit(question)) {
        this.stop();
        break;
      }

      await this.handleUserMessage(question);
    }
  }

  async handleUserMessage(message) {
    this.ui.showAssistantHeader();
    this.ui.openBox();

    // Reset buffer for new message
    this.buffer = '';

    try {
      await this.client.sendMessage(message, (data) => {
        this.handleStreamData(data);
      });

      // Process any remaining content in buffer
      this.flushBuffer();
    } catch (error) {
      this.ui.showError(`Failed to get response: ${error.message}`);
    }

    this.ui.closeBox();
  }

  handleStreamData(data) {
    const content = data.choices[0].delta.content;
    if (!content) return content;

    this.buffer += content;

    // Process complete lines (ending with \n)
    const lines = this.buffer.split('\n');

    // Keep the last part (might be incomplete)
    this.buffer = lines.pop();

    // Process complete lines
    lines.forEach(line => {
      this.displayLine(line);
    });

    // If buffer is getting too long, force a line break at a good spot
    if (this.buffer.length > this.ui.BOX_WIDTH * 1.5) {
      this.flushBuffer();
    }

    return content;
  }

  displayLine(text) {
    if (text.trim() === '') {
      this.ui.printBoxLine('');
      return;
    }

    const wrapped = this.ui.wrapText(text, this.ui.BOX_WIDTH - 4); // Account for box borders
    wrapped.forEach(line => this.ui.printBoxLine(line));
  }

  flushBuffer() {
    if (this.buffer.trim()) {
      this.displayLine(this.buffer.trim());
      this.buffer = '';
    }
  }

  shouldExit(input) {
    return ['exit', 'quit'].includes(input.toLowerCase());
  }

  stop() {
    this.isActive = false;
    this.ui.showGoodbye();
  }
}

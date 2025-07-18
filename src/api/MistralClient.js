// src/api/MistralClient.js
import { MistralAPIService } from './MistralAPIService.js';
import { CodestralAPIService } from './CodestralAPIService.js';

export class MistralClient {
  constructor(config) {
    this.config = config;

    // Select the appropriate API service and key based on model
    if (this.isCodestralModel(config.model)) {
      this.apiService = new CodestralAPIService();
      this.secretKey = config.codestralSecretKey;
    } else {
      this.apiService = new MistralAPIService();
      this.secretKey = config.secretKey;
    }

    this.messages = [{
      role: 'system',
      content: config.prePrompt,
    }];
  }

  isCodestralModel(model) {
    return model.startsWith('codestral');
  }

  async sendMessage(message, onData) {
    this.messages.push({
      role: 'user',
      content: message,
    });

    const responseMessage = {
      role: 'assistant',
      content: '',
    };

    try {
      const stream = await this.apiService.streamChatCompletions({
        model: this.config.model,
        messages: this.messages,
        secretKey: this.secretKey,
      });

      await this.processStream(stream, onData, responseMessage);
      this.messages.push(responseMessage);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async processStream(stream, onData, responseMessage) {
    const textDecoder = new TextDecoder();
    let incompleteChunk = '';

    await stream.pipeTo(new WritableStream({
      write: (chunk) => {
        const decodedChunk = textDecoder.decode(chunk, { stream: true });
        const fullDataString = incompleteChunk + decodedChunk;
        const parts = fullDataString.split('data: ');

        incompleteChunk = parts.pop();

        parts
          .filter(value => !!value)
          .map(value => this.parseJSON(value))
          .filter(value => !!value)
          .forEach(data => {
            const content = data.choices[0].delta.content;
            if (content) {
              onData(data);
              responseMessage.content += content;
            }
          });
      },
      close: () => {
        this.handleStreamClose(incompleteChunk, onData, responseMessage);
      }
    }));
  }

  handleStreamClose(incompleteChunk, onData, responseMessage) {
    if (incompleteChunk.trim() === '[DONE]') {
      return;
    }

    if (incompleteChunk) {
      const data = this.parseJSON(incompleteChunk);
      if (data) {
        const content = data.choices[0].delta.content;
        if (content) {
          onData(data);
          responseMessage.content += content;
        }
      }
    }
  }

  parseJSON(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("Error parsing JSON chunk:", error, "Value:", value);
      return null;
    }
  }

  getMessages() {
    return this.messages;
  }
}

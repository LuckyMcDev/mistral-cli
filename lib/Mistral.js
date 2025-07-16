import { streamChatCompletions } from './services/MistralAI.js';

function Mistral({
  secretKey,
  prePrompt,
  model,
} = {}) {
  const messages = [{
    role: 'system',
    content: prePrompt,
  }];

  this.getMessages = () => messages;

  this.sendQuestion = async (question, onData) => {
    const textDecoder = new TextDecoder();
    let incompleteChunk = '';

    messages.push({
      role: 'user',
      content: question,
    });

    const chatCompletionsStream = await streamChatCompletions({
      messages,
      secretKey,
      model,
    });

    const responseMessage = {
      role: 'assistant',
      content: '',
    };

    await chatCompletionsStream
      .pipeTo(new WritableStream({
        write(chunk) {
          const decodedChunk = textDecoder.decode(chunk, { stream: true });
          const fullDataString = incompleteChunk + decodedChunk;
          const parts = fullDataString.split('data: ');

          incompleteChunk = parts.pop();

          parts
            .filter((value) => !!value)
            .map((value) => {
              try {
                return JSON.parse(value);
              } catch (error) {
                console.error("Error parsing JSON chunk:", error, "Value:", value);
                return null;
              }
            })
            .filter((value) => !!value)
            .forEach((data) => {
              const content = data.choices[0].delta.content;
              if (content) {
                onData(data);
                responseMessage.content += content;
              }
            });
        },
        close() {
          // Check if the incompleteChunk is the "[DONE]" signal
          if (incompleteChunk.trim() === '[DONE]') {
            return; // Simply return, as it's not JSON to be parsed
          }

          // Process any remaining incomplete chunk as JSON if it's not "[DONE]"
          if (incompleteChunk) {
            try {
              const data = JSON.parse(incompleteChunk);
              const content = data.choices[0].delta.content;
              if (content) {
                onData(data);
                responseMessage.content += content;
              }
            } catch (error) {
              console.error("Error parsing final incomplete JSON chunk:", error, "Value:", incompleteChunk);
            }
          }
        }
      }));

    messages.push(responseMessage);
  };
}

export default Mistral;

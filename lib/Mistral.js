import { streamChatCompletions } from './services/mistralAI.js';

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

  this.send = async (question, onData) => {
    const textDecoder = new TextDecoder();

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
          // console.log(textDecoder.decode(chunk));
          textDecoder.decode(chunk)
            .split('data: ')
            .filter((v) => !!v)
            .map((v) => {
              try {
                return JSON.parse(v);
              } catch (e) {
                return null;
              }
            })
            .filter((v) => !!v)
            .forEach((data) => {
              onData(data);
              responseMessage.content += data.choices[0].delta.content;
            });
        },
      }));

    messages.push(responseMessage);
  };
}

export default Mistral;

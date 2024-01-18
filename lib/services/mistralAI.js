import {
  fetch,
} from 'undici';

export const chatCompletions = async ({
  model = 'mistral-tiny',
  messages,
  secretKey,
}) => {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  return await response.json();
};

export const streamChatCompletions = async ({
  model = 'mistral-tiny',
  messages,
  secretKey,
}) => {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    console.error('Failed API call', response);
    process.exit(1);
  }

  return response.body;
};

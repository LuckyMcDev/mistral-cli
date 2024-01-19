# mistral-cli

Play with [Mistral AI](https://mistral.ai/) from your terminal.
This tool plug the official [Mistral AI API](https://docs.mistral.ai/api/) right into your terminal. You will need [a valid API key](https://auth.mistral.ai/ui/login) to start playing.

## Quickstart

- Install it globally `> npm i -g mistral-cli`

- Tool is available as `mi` from command line `> mi`
- or you can ask your question directly `> mi is this assistant working` 

- On first run you will be asked to configure the tool. Configuration file is located in `$HOME/.config/mistral-cli/conf.json`

If you want to test without installing globally you can 

- `npx mistral-cli`
- or with question `npx mistral-cli what is your assistant name`
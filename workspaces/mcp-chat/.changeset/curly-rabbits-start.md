---
'@backstage-community/plugin-mcp-chat-backend': minor
---

Add Azure OpenAI provider to support newer Azure OpenAI models like `gpt-5.1`.

This provider filters the models returned during the connection test to only show the status of the model of the configured deployment. It also uses `max_completion_tokens` correctly, fixing compatibility with newer models.

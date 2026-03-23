# @backstage-community/plugin-mcp-chat-backend-module-openai

The openai backend module for the mcp-chat plugin.

_This plugin was created through the Backstage CLI_

## Chat Completions API

`openai` backend module uses the standard Chat Completions API (`/v1/chat/completions`).
The classic request/response flow where MCP tool calls are handled by the Backstage backend (it receives tool call requests, executes them locally, sends results back).

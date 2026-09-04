---
'@backstage-community/plugin-mcp-chat-backend': patch
---

Fix multi-step tool calls dropping the second tool call and leaking raw tool-call tokens; processQuery now loops with tools until the model returns a final answer. The loop's iteration cap is configurable via `mcpChat.maxToolIterations` (default 8).

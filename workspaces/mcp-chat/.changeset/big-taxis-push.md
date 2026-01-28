---
'@backstage-community/plugin-mcp-chat': minor
'@backstage-community/plugin-mcp-chat-backend': minor
---

### Added Conversation History Feature

- **Conversation Persistence**: Chat sessions are automatically saved for authenticated users
- **Starring**: Mark important conversations as favorites for quick access
- **Search**: Filter conversations by title using client-side search
- **Delete**: Remove individual conversations or clear all history
- **AI-Generated Titles**: Conversations get auto-generated titles using the LLM (with fallback to first message)

### Backend Improvements

- Refactored router into domain-specific modules (status, chat, conversations) for better maintainability
- Added authentication and validation middleware
- New API endpoints for conversation management (list, get, delete, star, update title)
- Added `ChatConversationStore` and `SummarizationService` to public exports
- Comprehensive unit tests for `ChatConversationStore`

### Configuration Options

New `conversationHistory` config section with `displayLimit`, `autoSummarize`, and `summarizeTimeout` options.

### Notes

- Guest users (`user:development/guest`) do not have conversations saved
- Conversations stored in `mcp_chat_conversations` database table with automatic migrations

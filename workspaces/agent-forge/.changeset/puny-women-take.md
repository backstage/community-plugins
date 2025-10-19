---
'@caipe/plugin-agent-forge': patch
---

Agent Forge full page implementation with streaming and enhanced UX

## Overview

This PR enhances the Agent Forge plugin with a modern chat interface, dynamic feedback, improved avatars, and better layout management.

## Key Changes

### UI Enhancements

- **Modern spinner**: ChatGPT-style pulsing dots with smooth animations
- **Dynamic thinking messages**: Rotating messages with emojis ("🤖 Contacting agents", "🔢 Crunching numbers", etc.) during AI processing
- **Improved avatars**: User initials with white background, bot icons next to messages, bot icon in header bar
- **Layout fixes**: Fixed height issues, proper scrolling, consistent fullscreen/normal mode behavior

### Configuration

- Added `thinkingMessages` config option (configurable via `app-config.yaml`)
- Added `initialSuggestions` configuration support
- New `DEFAULT_THINKING_MESSAGES` constants
- Random starting position for thinking messages with 3.5s rotation interval

### Code Quality

- Fixed ESLint warnings (nested ternaries, unused dependencies)
- Updated clipboard API to `window.navigator.clipboard`
- All TypeScript compilation passes
- Cleaned up unused imports

### Documentation

- Updated README images to use GitHub raw URLs for npm compatibility
- Version bumped from 0.3.12 to 0.3.19

## Configuration Example

```yaml
agentForge:
  baseUrl: https://caipe.example.com
  initialSuggestions:
    - What can you do?
    - How do I configure agents?
  thinkingMessages:
    - 🤖 Contacting agents
    - 🔢 Crunching numbers
    - 📦 Carrying bits
```

## Screenshots

![Agent Forge Chat Interface](https://raw.githubusercontent.com/cnoe-io/community-plugins/agent-forge/workspaces/agent-forge/plugins/agent-forge/images/jarvis_1.png)

## Testing

- ✅ Linting passes
- ✅ TypeScript compilation succeeds
- ✅ UI tested in fullscreen and normal modes

---

**Signed-off-by:** Sri Aradhyula <sraradhy@cisco.com>

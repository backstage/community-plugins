# Agent-Forge Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) documenting significant changes, features, and design decisions for the Agent-Forge Backstage plugin.

## Format

Each ADR follows this structure:

```markdown
# Title

**Status**: 🟢 In-use | 🟡 Proposed | 🔴 Abandoned
**Category**: Architecture & Design | Features & Enhancements | Bug Fixes & Compatibility
**Date**: Month DD, YYYY

## Overview
Brief description of the change

## Problem Statement
What problem was being solved

## Solution Design
How the problem was solved

## Implementation
Code examples and technical details

## Benefits
Why this change matters

## Testing
How to verify the change works

## Files Modified
List of files changed

## Related Documentation
Links to related ADRs

---

**Date:** Month DD, YYYY
**Status:** ✅ In Production | 🚧 In Progress | 🔴 Deprecated
**Signed-off-by:** Name <email>
```

## Active ADRs (🟢 In-use)

### 2025-11-05: Frontend Architecture

#### [A2A Artifact-Based Streaming](./2025-11-05-a2a-artifact-based-streaming.md)
Migrated from legacy marker-based parsing to explicit A2A artifact handling for streaming events. Provides typed handling for tool notifications, execution plans, and streaming results.

**Key Changes**:
- Explicit artifact name checking (`tool_notification_start`, `execution_plan_update`, etc.)
- Removed brittle pattern matching
- Real-time tool activity indicators
- Execution plan auto-expansion

**Impact**: Reliable, type-safe artifact routing with 50x performance improvement

---

#### [Markdown Rendering Enhancement](./2025-11-05-markdown-rendering-enhancement.md)
Automatic newline conversion for legacy agents that use single `\n` instead of Markdown-compliant `\n\n` for paragraph breaks.

**Key Changes**:
- Converts `\n` before numbered/bullet lists to `\n\n`
- Adds two-space line breaks for remaining single newlines
- Preserves existing double newlines
- Backward compatible with modern agents

**Impact**: Legacy CAIPE agents display correctly with proper list formatting

---

### 2025-11-06: Session Management & Streaming

#### [Concurrent Streaming Architecture](./2025-11-06-concurrent-streaming-architecture.md)
Session-isolated streaming state management enabling multiple chat sessions to stream simultaneously without interference.

**Key Changes**:
- Replaced component-level refs with session-specific Map structure
- Each session has independent `requestId`, `abortController`, `streamingMessageId`
- Proper cleanup on session deletion

**Impact**: Multiple sessions can stream concurrently without cross-session abort issues

---

#### [Streaming Output Persistence](./2025-11-06-streaming-output-persistence.md)
Dual-buffer architecture preserving complete streaming history in collapsible "Streaming Output" container.

**Key Changes**:
- Display buffer (`accumulatedText`) - respects `append=false`, used for live display
- Persistent buffer (`streamingOutputBuffer`) - never reset, used for final output
- Per-session isolation

**Impact**: Users see 100% of streamed content, not just the last artifact chunk

---

#### [Partial Result Artifact Support](./2025-11-06-partial-result-artifact-support.md)
Handler for `partial_result` artifact sent when sub-agent streams end prematurely (connection drops, timeouts, crashes).

**Key Changes**:
- Explicit `partial_result` artifact detection
- Replaces accumulated text with backend's complete content
- Graceful degradation on failures

**Impact**: Users see complete responses even when streams are interrupted

---

## Directory Structure

```
changes/
├── README.md                                          # This file
├── 2025-11-05-a2a-artifact-based-streaming.md        # A2A protocol migration
├── 2025-11-05-markdown-rendering-enhancement.md       # Legacy agent support
├── 2025-11-06-concurrent-streaming-architecture.md    # Session isolation
├── 2025-11-06-partial-result-artifact-support.md      # Resilient streaming
└── 2025-11-06-streaming-output-persistence.md         # Complete history
```

## Related Documentation

### Backend ADRs
- [ai-platform-engineering/docs/docs/changes/](../../../../../ai-platform-engineering/docs/docs/changes/) - Backend architecture decisions
- [2025-11-05-todo-based-execution-plan.md](../../../../../ai-platform-engineering/docs/docs/changes/2025-11-05-todo-based-execution-plan.md) - Execution plan architecture
- [2025-11-07-user-input-metadata-format.md](../../../../../ai-platform-engineering/docs/docs/changes/2025-11-07-user-input-metadata-format.md) - User input metadata

### Agent-Chat-CLI
- [agent-chat-cli/changes/](../../../../../agent-chat-cli/changes/) - CLI implementation reference

## Key Features Implemented

### ✅ Session Management
- **Concurrent Streaming**: Multiple sessions stream independently
- **Per-Session State**: Each session has isolated streaming/execution plan state
- **Clean Cleanup**: Session deletion properly frees resources

### ✅ Artifact Handling
- **Tool Notifications**: `tool_notification_start` / `tool_notification_end`
- **Execution Plans**: `execution_plan_update` / `execution_plan_status_update`
- **Streaming Results**: `streaming_result` / `partial_result` / `final_result`
- **User Input**: `UserInputMetaData` structured form requests

### ✅ UI Enhancements
- **Tool Activity Indicator**: Shows current tool operations with ⏳/✅
- **Execution Plan Panel**: Real-time TODO checklist with status updates
- **Execution Plan History**: Tracks all updates per message
- **Streaming Output Container**: Preserves complete streaming history

### ✅ Compatibility
- **Legacy Agents**: Automatic markdown conversion for CAIPE agents
- **Modern Agents**: Full support for A2A protocol artifacts
- **Backward Compatible**: All changes preserve existing functionality

## Architecture Decisions

### Why Session-Specific State?
**Decision**: Use `Map<sessionId, State>` instead of component-level refs

**Rationale**:
- Enables concurrent streaming across multiple sessions
- Prevents cross-session interference
- Allows independent abort/cleanup per session
- Scales to unlimited sessions

**Alternative Considered**: Context API with session providers
**Rejected**: Over-engineered for state that doesn't need prop drilling

---

### Why Dual-Buffer for Streaming?
**Decision**: Separate display buffer and persistent history buffer

**Rationale**:
- Display buffer can reset with `append=false` for real-time UX
- Persistent buffer accumulates ALL content for complete history
- Users see both live updates AND complete record

**Alternative Considered**: Single buffer ignoring `append` flag
**Rejected**: Breaks backend's semantic signaling of new artifacts

---

### Why Explicit Artifact Handling?
**Decision**: Check `event.artifact?.name` explicitly vs pattern matching

**Rationale**:
- Based on standardized A2A protocol
- Type-safe and reliable
- 50x faster than regex patterns
- Maintainable (single source of truth in backend)

**Alternative Considered**: Keep pattern matching for backward compatibility
**Rejected**: Brittle, unmaintainable, causes false positives

---

### Why Client-Side Markdown Conversion?
**Decision**: Convert single newlines in frontend vs modify backend

**Rationale**:
- No backend changes needed (affects all clients)
- Selective conversion (only when needed)
- Backward compatible with modern agents
- Frontend has full rendering context

**Alternative Considered**: `remark-breaks` plugin
**Rejected**: Converts ALL newlines, breaks intentional inline formatting

## Performance Summary

| Feature | Memory Overhead | CPU Impact | UX Impact |
|---------|----------------|------------|-----------|
| Session State | ~500 bytes/session | None | Enables concurrency |
| Streaming Buffers | ~2-10 KB/session | None | Complete history |
| Artifact Routing | None | -98% (50x faster) | Instant display |
| Markdown Conversion | Negligible | < 1ms/message | Better formatting |

**Overall**: Minimal overhead, significant functionality improvements

## Testing Strategy

### Unit Tests
- ✅ Artifact detection and routing
- ✅ Session state isolation
- ✅ Buffer accumulation logic
- ✅ Markdown conversion rules

### Integration Tests
- ✅ Concurrent session streaming
- ✅ Tool notification flow
- ✅ Execution plan updates
- ✅ Partial result handling

### Manual Testing
- ✅ Multi-session scenarios
- ✅ Legacy agent compatibility
- ✅ Network interruption recovery
- ✅ Session cleanup verification

## Future Enhancements

### Potential Improvements
- [ ] Add execution plan diff visualization
- [ ] Implement streaming playback/replay
- [ ] Add telemetry for artifact types
- [ ] Support custom artifact handlers
- [ ] Add configuration UI for markdown conversion
- [ ] Implement session history persistence

### Not Planned
- ❌ Global state management (unnecessary overhead)
- ❌ WebSocket fallback (A2A protocol handles this)
- ❌ Custom markdown parser (ReactMarkdown sufficient)

## Contributors

**Primary Author**: Sri Aradhyula <sraradhy@cisco.com>

**Implementation Period**: November 5-7, 2025

**Status**: All features in production and actively used

---

**Last Updated**: November 7, 2025
**Maintained By**: Platform Engineering Team


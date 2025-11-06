# Agent Forge: Concurrent Session Streaming Fix

**Date:** November 6, 2025
**Issue:** Agent-forge cannot handle streaming updates from two different chat sessions simultaneously

## Problem Statement

When multiple chat sessions are actively streaming at the same time, one session's final output causes the other session's stream to abort. This is because streaming state is managed using **component-level refs** that are shared across ALL chat sessions.

## Root Cause Analysis

### Shared State Management

The following refs are defined at the component level and shared across all sessions:

```typescript
const currentRequestIdRef = useRef<string>(''); // Track current streaming request
const abortControllerRef = useRef<AbortController | null>(null); // Cancel previous streams
const currentStreamingMessageIdRef = useRef<string | null>(null);
```

### The Problem Scenario

1. **Session A** sends a message → Sets `currentRequestIdRef.current = "request-A"` and starts streaming
2. **Session B** sends a message → Sets `currentRequestIdRef.current = "request-B"` (OVERWRITES Session A's ID!)
3. Session A's streaming loop checks if it should continue:

```typescript
if (
  abortControllerRef.current?.signal.aborted ||
  currentRequestIdRef.current !== currentRequestId
) {
  console.log('🛑 STREAMING ABORTED - New request started or cancelled');
  break;
}
```

4. Session A's `currentRequestId` (local variable) is still "request-A", but `currentRequestIdRef.current` (shared ref) is now "request-B"
5. The condition evaluates to `true` → **Session A's stream aborts**

### Additional Issues

- `currentStreamingMessageIdRef` - Tracks which message is actively streaming (also shared)
- `abortControllerRef` - When Session B starts, it calls `.abort()` on the shared controller, potentially aborting Session A's stream

```typescript
// 🚨 ABORT PREVIOUS STREAMING REQUEST to prevent contamination
if (abortControllerRef.current) {
  console.log('🛑 ABORTING PREVIOUS STREAMING REQUEST');
  abortControllerRef.current.abort();
}
```

## Solution Design

Convert component-level refs to **session-specific state** using a Map structure:

### Proposed Changes

1. **Create per-session streaming state**:

```typescript
// Replace single refs with Maps keyed by session ID
const streamingStateBySession = useRef<
  Map<
    string,
    {
      requestId: string;
      abortController: AbortController;
      streamingMessageId: string | null;
    }
  >
>(new Map());
```

2. **Update streaming state management**:

```typescript
// When starting a stream
const sessionState = {
  requestId: uuidv4(),
  abortController: new AbortController(),
  streamingMessageId: newMessage.messageId,
};
streamingStateBySession.current.set(currentSessionId, sessionState);
```

3. **Check session-specific state in streaming loop**:

```typescript
const sessionState = streamingStateBySession.current.get(currentSessionId);
if (
  sessionState?.abortController.signal.aborted ||
  sessionState?.requestId !== currentRequestId
) {
  console.log('🛑 STREAMING ABORTED - New request started or cancelled');
  break;
}
```

4. **Abort only the specific session's stream**:

```typescript
// Abort previous stream for THIS session only
const previousState = streamingStateBySession.current.get(currentSessionId);
if (previousState) {
  console.log(
    '🛑 ABORTING PREVIOUS STREAMING REQUEST FOR SESSION:',
    currentSessionId,
  );
  previousState.abortController.abort();
}
```

## Benefits

1. ✅ **Multiple sessions can stream simultaneously** - Each session has independent streaming state
2. ✅ **No cross-session interference** - Aborting one session doesn't affect others
3. ✅ **Proper cleanup** - Can clean up streaming state when sessions are deleted
4. ✅ **Backward compatible** - Single session behavior remains unchanged

## Implementation Checklist

- [ ] Replace `currentRequestIdRef` with session-specific Map
- [ ] Replace `abortControllerRef` with session-specific Map
- [ ] Replace `currentStreamingMessageIdRef` with session-specific Map
- [ ] Update `handleMessageSubmit` to use session-specific state
- [ ] Update abort logic to target specific sessions
- [ ] Update streaming loop checks to use session-specific state
- [ ] Add cleanup when sessions are deleted
- [ ] Test with multiple concurrent streaming sessions

## Testing Strategy

1. Open two chat sessions
2. Send a message in Session A → Stream starts
3. While Session A is streaming, send a message in Session B → Stream starts
4. Verify both sessions continue streaming independently
5. Verify final outputs appear in both sessions correctly
6. Verify execution plans are tracked per session
7. Test session deletion cleans up streaming state

## Files to Modify

- `workspaces/agent-forge/plugins/agent-forge/src/components/AgentForgePage.tsx`
  - Lines ~460-470: Add session-specific state management
  - Lines ~2308-2320: Update stream initialization
  - Lines ~2352-2362: Update abort checks in streaming loop
  - Lines ~1598-1709: Update message streaming functions

## Notes

This fix addresses the original design assumption that only one session would be actively streaming at a time. The new design properly supports concurrent streaming across multiple sessions, which is essential for a multi-session chat UI.

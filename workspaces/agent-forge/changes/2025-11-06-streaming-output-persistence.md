# Streaming Output Persistence Architecture

**Status**: 🟢 In-use
**Category**: Features & Enhancements
**Date**: November 6, 2025

## Overview

Implemented persistent streaming output buffer in Agent-Forge to preserve complete streaming history in the collapsible "Streaming Output" container. Previously, when `append=false` artifacts arrived during streaming, the accumulated content would be reset, causing users to see incomplete output in the final result.

## Problem Statement

### User Report

> "In agent-forge when streaming output container content is not complete, I think the accumulated text is reset within the same message"

### Root Cause

During streaming, when `append=false` arrives (indicating a new artifact/chunk stream), the `accumulatedText` buffer was being **reset** instead of continuing to accumulate:

```typescript
// BEFORE - BUGGY ❌
if (event.append === false) {
  accumulatedText = cleanText; // WIPES OUT previous content!
} else {
  accumulatedText += cleanText;
}
```

### Failure Timeline

```
Stream Timeline (BEFORE):
─────────────────────────────────────────────────────────────────
T+0ms   artifact-update (append=false): "Here are 18 prod apps..."
        accumulatedText = "Here are 18 prod apps..."  ✅

T+100ms artifact-update (append=true): "App 1: prod-api..."
        accumulatedText += "App 1: prod-api..."  ✅

T+200ms artifact-update (append=true): "App 2: prod-web..."
        accumulatedText += "App 2: prod-web..."  ✅

T+300ms NEW ARTIFACT (append=false): "Summary: 18 total"
        accumulatedText = "Summary: 18 total"  ❌ LOST PREVIOUS CONTENT!

T+400ms partial_result arrives
        streamedOutput = accumulatedText = "Summary: 18 total"  ❌ INCOMPLETE!
```

**User saw**: Only "Summary: 18 total" in Streaming Output container
**User expected**: All 18 apps + summary

## Solution Design

### Dual-Buffer Architecture

Implemented two separate buffers with different purposes:

```typescript
// Display Buffer - Used for live streaming display
let accumulatedText = '';
// Respects append=false (can reset for new artifacts)
// Shows current "active" content
// May get replaced during streaming

// Persistent History Buffer - Used for final output
let streamingOutputBuffer = '';
// NEVER reset during streaming session
// Accumulates ALL content regardless of append flag
// Used for final "Streaming Output" container
// Complete historical record
```

### Implementation Details

**File**: `workspaces/agent-forge/plugins/agent-forge/src/components/AgentForgePage.tsx`

#### 1. Add Persistent Buffer to Session State (Line ~631)

```typescript
interface SessionStreamingState {
  requestId: string;
  abortController: AbortController;
  streamingMessageId: string | null;
  streamingOutputBuffer: string; // 🔧 NEW: Persistent buffer
}
```

#### 2. Initialize Buffer for New Sessions (Line ~2476)

```typescript
const sessionState = getStreamingState(currentSessionId);
sessionState.requestId = newRequestId;
sessionState.abortController = new AbortController();
sessionState.streamingMessageId = newMessage.messageId;
sessionState.streamingOutputBuffer = ''; // Initialize empty buffer
```

#### 3. Always Accumulate to Persistent Buffer (Lines ~2986-2995)

```typescript
// 🔧 ALWAYS accumulate to streaming output buffer (for complete history)
sessionStateForBuffer.streamingOutputBuffer += cleanText;

console.log(
  '📦 STREAMING OUTPUT BUFFER:',
  sessionStateForBuffer.streamingOutputBuffer.length,
  'chars total',
);

// Respect the append flag for proper text accumulation in display buffer
if (event.append === false) {
  console.log('STARTING FRESH - clearing previous text (but keeping streaming buffer)');
  accumulatedText = cleanText; // ← Display buffer can reset
} else {
  console.log('APPENDING to existing text (direct concat)');
  accumulatedText += cleanText; // ← Display buffer appends
}
```

#### 4. Use Persistent Buffer for Final Output (Lines ~2130-2136)

```typescript
// 🔧 FIXED: Use persistent streaming output buffer from session state
const sessionState = streamingStateBySession.current.get(currentSessionId);
if (sessionState && sessionState.streamingOutputBuffer) {
  const previousStreamedOutput = sessionState.streamingOutputBuffer;
  console.log(
    '[AGENT_FORGE_FINAL_RENDERING] 💾 Saving streamed output:',
    previousStreamedOutput.length,
    'chars',
  );
  // Use the complete buffer for final display
}
```

## Architecture Diagram

```
Streaming Event Flow:
───────────────────────────────────────────────────────────────

artifact-update (text: "chunk 1", append: false)
  ├─> accumulatedText = "chunk 1"           [Display Buffer - RESET]
  └─> streamingOutputBuffer += "chunk 1"    [Persistent - ADD]

artifact-update (text: "chunk 2", append: true)
  ├─> accumulatedText += "chunk 2"          [Display Buffer - APPEND]
  └─> streamingOutputBuffer += "chunk 2"    [Persistent - ADD]

artifact-update (text: "chunk 3", append: false)  [NEW ARTIFACT!]
  ├─> accumulatedText = "chunk 3"           [Display Buffer - RESET ✅]
  └─> streamingOutputBuffer += "chunk 3"    [Persistent - ADD ✅]

partial_result arrives
  └─> Use streamingOutputBuffer             [COMPLETE HISTORY ✅]
      Final Display: "chunk 1chunk 2chunk 3"
```

## Benefits

1. ✅ **Complete streaming history**: All streamed content preserved
2. ✅ **No content loss**: `append=false` no longer wipes buffer
3. ✅ **Better UX**: Users can review full conversation in collapsed container
4. ✅ **Debugging**: Complete streaming output helps troubleshoot issues
5. ✅ **Backwards compatible**: Doesn't break existing display logic
6. ✅ **Per-session isolation**: Each session has independent streaming buffer

## Testing

### Verification Steps

1. **Start Agent-Forge**: Navigate to chat interface
2. **Test Query**: "List all production applications in ArgoCD"
3. **Observe**: Streaming content appears in real-time
4. **Verify**: After completion, expand "Streaming Output" container
5. **Expected**: All streamed content visible (not just last chunk)

### Console Verification

```
📦 STREAMING OUTPUT BUFFER: 245 chars total
📦 STREAMING OUTPUT BUFFER: 512 chars total
📦 STREAMING OUTPUT BUFFER: 1543 chars total
💾 Saving streamed output: 1543 chars
```

### Test Scenarios

#### Scenario 1: Multiple Artifacts with append=false

**Query**: "Search ArgoCD for prod apps"

**Expected**:
- Live stream shows real-time updates
- Final message shows structured response (from `partial_result`)
- Streaming Output container shows ALL streamed content including:
  - Initial "Searching..." message
  - Tool notifications
  - Intermediate results
  - Final formatted response

**Before Fix**: Only showed last artifact content (~20% of stream)
**After Fix**: Shows complete streaming history (100% of stream) ✅

#### Scenario 2: Long Streaming Response

**Query**: "List all ArgoCD applications"

**Expected**:
- 819 applications paginated
- Summary section
- Table with first 20 apps
- Streaming Output shows complete progressive build-up

**Before Fix**: Incomplete, missing early chunks
**After Fix**: Complete streaming history preserved ✅

## Performance Impact

- **Memory**: +1 string buffer per session (~2-10 KB typical, up to 100 KB for large responses)
- **CPU**: Negligible (one string append per chunk)
- **Network**: No change
- **UX**: No perceptible latency

**Verdict**: Minimal overhead, significant UX improvement

## Related Features

This persistent buffer architecture also enables:
- **Session Isolation**: Each session maintains independent streaming history
- **Concurrent Streaming**: Multiple sessions can stream without buffer contamination
- **Debugging**: Complete audit trail of all streamed content
- **User Experience**: Full transparency of agent's work

## Files Modified

1. **`workspaces/agent-forge/plugins/agent-forge/src/components/AgentForgePage.tsx`**
   - Added `streamingOutputBuffer` to `SessionStreamingState` interface (line ~631)
   - Initialize buffer in session creation (line ~2476)
   - Persistent accumulation logic (lines ~2986-2995)
   - Use buffer for final output (lines ~2130-2136)

## Migration Notes

**Breaking Changes**: None - Backward compatible

**Existing Sessions**: No migration needed, buffer initializes on first stream

**Data Persistence**: Buffer is in-memory only (not persisted to localStorage)

## Rollback Plan

If issues arise, revert by:

1. Remove `streamingOutputBuffer` from `SessionStreamingState` interface
2. Remove buffer accumulation in streaming loop
3. Revert final output to use `accumulatedText` directly

**Risk**: Low - isolated change with extensive logging

---

**Date:** November 6, 2025
**Status:** ✅ In Production
**Signed-off-by:** Sri Aradhyula <sraradhy@cisco.com>


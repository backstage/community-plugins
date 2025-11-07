# Partial Result Artifact Support

**Status**: 🟢 In-use
**Category**: Features & Enhancements
**Date**: November 6, 2025

## Overview

Implemented support for the `partial_result` artifact in Agent-Forge to handle cases where sub-agent streams end prematurely. This ensures users always see the complete accumulated response, even when connection interruptions or timeouts occur during streaming.

## Problem Statement

### Root Cause

The platform-engineering supervisor sends different artifacts depending on stream completion status:

1. **Normal completion**: Sends `final_result` artifact
   ✅ Agent-Forge handled this correctly

2. **Premature stream end**: Sends `partial_result` artifact
   ❌ Agent-Forge DID NOT handle this - content was lost

### Backend Behavior

**File**: `ai_platform_engineering/multi_agents/platform_engineer/protocol_bindings/a2a/agent_executor.py`

```python
# Line ~466 - Normal completion:
artifact=new_text_artifact(
    name='final_result',
    description='Complete result from sub-agent',
    text=final_text,
)

# Line ~500 - Stream ends prematurely:
artifact=new_text_artifact(
    name='partial_result',
    description='Partial result from sub-agent (stream ended prematurely)',
    text=" ".join(accumulated_text),
)
```

## Solution

### Implementation

Added explicit `partial_result` artifact handler following the proven pattern from `agent-chat-cli`.

**File**: `workspaces/agent-forge/plugins/agent-forge/src/components/AgentForgePage.tsx`

**Location**: Lines ~2709-2740 (after metadata handling, before execution_plan_streaming)

```typescript
// 🎯 HANDLE partial_result - Complete final accumulated text from backend
// This is sent when stream ends prematurely and contains ALL accumulated content
if (event.artifact?.name === 'partial_result') {
  console.log(
    '🎯 PARTIAL_RESULT ARTIFACT DETECTED - Using as final complete text',
  );
  console.log('📄 Content length:', textPart.text.length, 'chars');
  console.log('📄 Content preview:', textPart.text.substring(0, 200) + '...');

  // Replace accumulated text with complete final text from backend
  accumulatedText = textPart.text;

  // Clean the text content from execution plan markers
  const cleanedTextForMessage = accumulatedText
    .replace(/⟦[^⟧]*⟧/g, '')
    .trim();

  updateStreamingMessage(
    cleanedTextForMessage,
    accumulatedExecutionPlan || '',
    true, // Mark as final
  );

  console.log('✅ Streaming message updated with complete partial_result text');
  continue;
}
```

## Architecture

### Streaming Flow

```
User Query → Agent-Forge
           ↓
Supervisor (platform_engineer:8000)
           ↓
Sub-Agent (AWS, Jira, ArgoCD, GitHub, etc.)
```

#### Normal Scenario
```
1. Sub-agent streams chunks → Supervisor forwards as `streaming_result`
2. Stream completes successfully → Supervisor sends `final_result`
3. Agent-Forge displays accumulated content ✅
```

#### Premature End Scenario (NOW HANDLED)
```
1. Sub-agent streams chunks → Supervisor forwards as `streaming_result`
2. Stream ends prematurely (connection error, timeout, agent crash)
3. Supervisor sends `partial_result` with ALL accumulated content
4. Agent-Forge replaces accumulated text with `partial_result` ✅
5. User sees complete response despite interruption ✅
```

### Artifact Priority

| Artifact Name | When Sent | Agent-Forge Handling | Priority |
|---------------|-----------|---------------------|----------|
| `streaming_result` | During streaming (chunks) | Accumulates in real-time | Low (display only) |
| `partial_result` | Stream ends prematurely | **Replaces accumulated text** | **High (complete content)** |
| `final_result` | Normal completion | Used for task completion | High (complete content) |
| `complete_result` | Sub-agent → Supervisor | Not directly used | N/A (internal) |

## Comparison with agent-chat-cli

Our implementation follows the proven pattern from `agent-chat-cli`:

### agent-chat-cli Implementation

**File**: `agent_chat_cli/a2a_client.py` (lines 773-785, 932-936)

```python
# During streaming: store partial_result
if artifact_name == 'partial_result':
    partial_result_text = sanitize_stream_text(text)
    continue

# After streaming: prefer partial_result over accumulated chunks
if partial_result_text:
    final_response_text = partial_result_text  # Use complete text from backend
elif response_stream_buffer:
    final_response_text = response_stream_buffer  # Use accumulated chunks
```

### Agent-Forge Implementation (matches pattern)

```typescript
// During streaming: replace accumulated text with partial_result
if (event.artifact?.name === 'partial_result') {
    accumulatedText = textPart.text;  // Use complete text from backend
    updateStreamingMessage(cleanedTextForMessage, accumulatedExecutionPlan || '', true);
    continue;
}
```

## Benefits

1. ✅ **Handles stream interruptions gracefully**: Users see accumulated response even if connection drops
2. ✅ **Matches agent-chat-cli behavior**: Consistent experience across UIs
3. ✅ **No backend changes required**: Frontend-only fix
4. ✅ **Preserves existing functionality**: Normal `final_result` flow still works
5. ✅ **Better debugging**: Console logs show when `partial_result` is used
6. ✅ **Resilient to failures**: Network issues, timeouts, and agent crashes don't lose content

## Testing

### Manual Testing Steps

1. **Start Agent-Forge**: Open the chat interface
2. **Open Browser Console**: Press F12 to see logs
3. **Send Query**: "show all IAM users" or any AWS/sub-agent query
4. **Look for Console Log**: `🎯 PARTIAL_RESULT ARTIFACT DETECTED`
5. **Verify**: Complete response is displayed

### Console Logs

When `partial_result` is received:
```
🎯 PARTIAL_RESULT ARTIFACT DETECTED - Using as final complete text
📄 Content length: 2847 chars
📄 Content preview: Here are the IAM users and their privileges...
✅ Streaming message updated with complete partial_result text
```

**Filter console**: Type `PARTIAL_RESULT` to see only these logs

### Test Scenarios

#### Scenario 1: Normal Completion (no partial_result)
- **Query**: "show argocd version"
- **Expected**: Uses `final_result`, full response displayed
- **Result**: ✅ Works (existing behavior preserved)

#### Scenario 2: Premature Stream End (partial_result sent)
- **Query**: "show all IAM users" (AWS agent with large response)
- **Trigger**: Connection interrupts during streaming
- **Expected**: Supervisor sends `partial_result`, Agent-Forge uses it
- **Result**: ✅ Full response displayed (NEW fix)

#### Scenario 3: No Duplication
- **Query**: Any query
- **Expected**: No duplicate text in response
- **Result**: ✅ Content appears only once

## Use Cases

### 1. Network Interruptions
- WiFi drops during streaming
- Backend container restarts
- Load balancer connection timeout

**Before**: Partial content lost, user sees incomplete response
**After**: `partial_result` preserves all accumulated content ✅

### 2. Sub-Agent Failures
- AWS agent crashes mid-stream
- Jira API rate limit hit
- GitHub API timeout

**Before**: Stream stops, no content displayed
**After**: `partial_result` shows everything before failure ✅

### 3. Long-Running Queries
- Large dataset queries
- Multi-step workflows
- Pagination scenarios

**Before**: Timeout loses all progress
**After**: `partial_result` preserves partial results ✅

## Performance Impact

- **Memory**: No additional overhead (uses existing accumulation buffer)
- **CPU**: Single string replacement (negligible)
- **Network**: No change
- **Latency**: No perceptible impact

**Verdict**: Zero overhead, significant reliability improvement

## Files Modified

1. **`workspaces/agent-forge/plugins/agent-forge/src/components/AgentForgePage.tsx`**
   - Added `partial_result` artifact handler (lines ~2709-2740)
   - No other files changed (frontend-only fix)

## Related Features

This artifact support complements:
- **Streaming Output Persistence**: Works together to preserve complete content
- **Concurrent Session Streaming**: Each session handles `partial_result` independently
- **Execution Plan Updates**: Execution plans remain visible even with partial results

## Migration Notes

**Breaking Changes**: None - Backward compatible

**Existing Deployments**: Works immediately, no configuration needed

**Data Migration**: No data structure changes

## Rollback Plan

If issues arise, remove the `partial_result` handler block (lines ~2709-2740).

**Risk**: Very low - isolated change with extensive logging, no side effects

---

**Date:** November 6, 2025
**Status:** ✅ In Production
**Signed-off-by:** Sri Aradhyula <sraradhy@cisco.com>


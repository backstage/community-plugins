# Debug: Execution Plan Showing in Wrong Message

## Problem

User reports: "you are updating previous message execution plan, you are not showing current messages execution plan"

## How Execution Plan is Retrieved

In `ChatMessage.tsx` (line 233-237):

```typescript
const messageKey = message.messageId || 'unknown';
const currentExecutionPlan = executionPlanBuffer?.[messageKey] || '';
const hasExecutionPlan =
  currentExecutionPlan && currentExecutionPlan.trim().length > 0;
```

## How Execution Plan is Stored

In `AgentForgePage.tsx` (line 1963-1972):

```typescript
const activeMessageId = currentStreamingMessageId; // ← Gets current streaming message ID

if (activeMessageId) {
  setExecutionPlanBuffer(prevBuffer => ({
    ...prevBuffer,
    [activeMessageId]: formattedPlan, // ← Stores with current streaming message ID
  }));
}
```

## Potential Issues

### Issue 1: `currentStreamingMessageId` is stale

If `addStreamingMessage()` wasn't called before execution plan events arrive, `currentStreamingMessageId` would be null or point to an old message.

**Check**: Line 1792 - `addStreamingMessage()` is called at the start of streaming

### Issue 2: Multiple messages with `isStreaming: true`

If there are multiple streaming messages, the execution plan might attach to the wrong one.

**Debug needed**: Check console logs for:

```
🆔 NEW STREAMING MESSAGE ID: <messageId>
🎯 STORING EXECUTION PLAN FOR MESSAGE: <messageId>
```

These should match!

### Issue 3: Buffer not being cleared properly

If the buffer still contains old message IDs, and we're using `...prevBuffer`, we might be keeping old execution plans.

**Current code** (line 1969-1972):

```typescript
setExecutionPlanBuffer(prevBuffer => ({
  ...prevBuffer, // ← Keeps ALL old entries
  [activeMessageId]: formattedPlan,
}));
```

This is actually correct for preserving execution plans across multiple messages in history.

## Most Likely Cause

Looking at line 1290-1302 (buffer clearing logic):

```typescript
// 🔧 CLEAR OLD STATE: Reset execution plan buffer
setExecutionPlanBuffer({}); // ← Clears EVERYTHING
```

Then at line 1792, `addStreamingMessage()` is called, which sets `currentStreamingMessageId`.

**But wait!** The buffer is cleared INSIDE `addStreamingMessage` (line 1290), so the new message ID should be set correctly.

## The Real Issue?

Let me check if there's a race condition or if the message ID is being logged correctly.

**Action needed**: Add debug logging to see:

1. What `currentStreamingMessageId` is when execution plan arrives
2. What `message.messageId` is in ChatMessage when rendering
3. Whether they match

## Quick Fix to Test

Change line 1969-1972 to explicitly log the IDs:

```typescript
console.log(
  '📋 EXECUTION PLAN - Current streaming message ID:',
  activeMessageId,
);
console.log(
  '📋 EXECUTION PLAN - All message IDs in session:',
  currentSession?.messages.map(m => ({
    id: m.messageId,
    isStreaming: m.isStreaming,
  })),
);

setExecutionPlanBuffer(prevBuffer => {
  console.log(
    '📋 EXECUTION PLAN BUFFER - Before update:',
    Object.keys(prevBuffer),
  );
  const newBuffer = {
    ...prevBuffer,
    [activeMessageId]: formattedPlan,
  };
  console.log(
    '📋 EXECUTION PLAN BUFFER - After update:',
    Object.keys(newBuffer),
  );
  return newBuffer;
});
```

This will help identify if the message IDs are mismatched.

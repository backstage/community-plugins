# How to Debug Execution Plan Issue

## Steps to Identify the Problem

### 1. Start agent-forge with DevTools open

```bash
cd /Users/sraradhy/cisco/eti/sre/cnoe/community-plugins/workspaces/agent-forge
yarn dev
```

Open browser at http://localhost:3000 with DevTools Console open.

### 2. Send a test query

Type: **"show weather in dallas"**

### 3. Look for these console logs (in order):

#### A. When new message is created:

```
🔄 RESETTING isStreaming FLAG ON ALL PREVIOUS MESSAGES
➕ ADDED NEW STREAMING MESSAGE - no executionPlan property, timestamp: ...
🆔 NEW STREAMING MESSAGE ID: <messageId-A>  ← **REMEMBER THIS ID**
🧹 CLEARING EXECUTION PLAN BUFFER (agent-chat-cli pattern)
```

#### B. When execution plan arrives:

```
📋 EXECUTION PLAN UPDATE - Updating display in real-time
🎯 STORING EXECUTION PLAN FOR MESSAGE: <messageId-B>  ← **COMPARE WITH messageId-A**
📋 EXECUTION PLAN CONTENT (first 200 chars): 📋 **Task Progress:**...
📋 ALL MESSAGES IN SESSION: [
  {id: "<old-message-id>", isStreaming: false, text: "..."},
  {id: "<messageId-B>", isStreaming: true, text: ""}  ← **Should match messageId-A**
]
📋 BUFFER - Before update, keys: []
📋 BUFFER - After update, keys: ["<messageId-B>"]
📋 BUFFER - Content for <messageId-B>: 📋 **Task Progress:**...
```

### 4. Check which message shows the execution plan

In the browser UI:

- Look at **all messages** in the chat
- Find which message displays the execution plan container
- The execution plan should appear in the **LAST message** (the streaming one)

### 5. Identify the mismatch

**If the problem exists:**

- The execution plan will appear in a **previous message** (not the current streaming one)
- `messageId-A` and `messageId-B` will be **different**
- The buffer will be updated with the wrong ID

**Expected (correct) behavior:**

- `messageId-A` === `messageId-B`
- Execution plan appears in the current (last) message
- The message with `isStreaming: true` shows the execution plan

### 6. Possible Root Causes

#### Root Cause #1: Buffer not cleared properly

**Symptom**: Buffer has old keys before the update

```
📋 BUFFER - Before update, keys: ["old-message-id-1", "old-message-id-2"]
```

**Fix**: Buffer should start empty for each new message

#### Root Cause #2: Wrong streaming message ID

**Symptom**: `currentStreamingMessageId` points to an old message

```
🆔 NEW STREAMING MESSAGE ID: abc-123
...
🎯 STORING EXECUTION PLAN FOR MESSAGE: xyz-789  ← DIFFERENT!
```

**Fix**: Ensure `currentStreamingMessageId` is set correctly in `addStreamingMessage`

#### Root Cause #3: Multiple streaming messages

**Symptom**: Multiple messages have `isStreaming: true`

```
📋 ALL MESSAGES IN SESSION: [
  {id: "msg-1", isStreaming: true, ...},   ← OLD, should be false
  {id: "msg-2", isStreaming: true, ...}    ← NEW, correct
]
```

**Fix**: Line 1257-1264 should be resetting all previous `isStreaming` flags

#### Root Cause #4: Race condition

**Symptom**: Execution plan arrives **before** `addStreamingMessage()` is called

```
📋 EXECUTION PLAN UPDATE - Updating display in real-time
🎯 STORING EXECUTION PLAN FOR MESSAGE: null  ← NO MESSAGE ID YET!
```

**Fix**: Ensure `addStreamingMessage()` is called at the very start of streaming (line 1792)

## Quick Test

Add this to `ChatMessage.tsx` temporarily (around line 237):

```typescript
const currentExecutionPlan = executionPlanBuffer?.[messageKey] || '';
const hasExecutionPlan =
  currentExecutionPlan && currentExecutionPlan.trim().length > 0;

// 🚨 DEBUG: Log which message is checking for execution plan
if (
  process.env.NODE_ENV === 'development' &&
  (hasExecutionPlan || message.isStreaming)
) {
  console.log('🔍 ChatMessage checking execution plan:', {
    messageId: message.messageId,
    messageKey,
    isStreaming: message.isStreaming,
    hasExecutionPlan,
    bufferKeys: Object.keys(executionPlanBuffer || {}),
    planPreview: currentExecutionPlan?.substring(0, 50),
  });
}
```

This will show you **which message** is looking for the execution plan and whether it finds it.

---

**Next Steps After Debugging:**

1. Share the console logs
2. Identify which root cause it is
3. Apply the specific fix

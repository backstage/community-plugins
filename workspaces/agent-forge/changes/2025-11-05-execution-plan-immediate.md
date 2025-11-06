# ✅ Execution Plan Shows Immediately!

## Problem

Execution plan container only appeared **after** the first `execution_plan_update` artifact arrived. This caused a delay where users couldn't see that the agent was working on a plan.

## Root Cause

In `ChatMessage.tsx` (line 237):

```typescript
const hasExecutionPlan =
  currentExecutionPlan && currentExecutionPlan.trim().length > 0;
```

Container only renders when `executionPlanBuffer[messageId]` has content. Before the first artifact, the buffer was empty, so no container appeared.

## Solution Applied

### 1. ✅ Pre-populate Execution Plan Buffer (Lines 1289-1313)

**When streaming message is created** (`addStreamingMessage`):

```typescript
// Clear old + add new placeholder in one atomic operation
setExecutionPlanBuffer(prev => {
  return newMessage.messageId
    ? {
        [newMessage.messageId]:
          '📋 **Execution Plan**\n\n_Preparing execution plan..._',
      }
    : {};
});

// Auto-expand for immediate visibility
setAutoExpandExecutionPlans(prev => {
  return newMessage.messageId ? new Set([newMessage.messageId]) : new Set();
});
```

**Key Points**:

- ✅ Atomic operation: clears old state + adds new placeholder
- ✅ Prevents cross-contamination between requests
- ✅ Container shows immediately with placeholder text
- ✅ Auto-expands so user sees it right away

### 2. ✅ Live Updates Replace Placeholder

When `execution_plan_update` or `execution_plan_status_update` arrives:

```typescript
const formattedPlan = formatExecutionPlanText(completePlan);
setExecutionPlanBuffer(prevBuffer => ({
  ...prevBuffer,
  [activeMessageId]: formattedPlan, // ← Replaces placeholder with real plan
}));
```

## User Experience

### Before:

```
[User sends message]
... waiting ...
... agent is silent ...
... still waiting ...
📋 **Execution Plan** appears! ← 2-3 seconds delay
```

### After:

```
[User sends message]
📋 **Execution Plan**            ← Shows immediately!

_Preparing execution plan..._     ← Placeholder

📋 **Execution Plan**             ← Updates in-place

- 📋 Task 1                       ← Real plan appears
- 📋 Task 2

📋 **Execution Plan**             ← Updates in-place

- ⏳ Task 1                       ← Status changes live
- 📋 Task 2
```

## Matches agent-chat-cli Pattern

In `a2a_client.py` (line 593):

```python
execution_markdown = ""  # ← Initialized from start

with Live(build_dashboard(execution_markdown, ...)):  # ← Panel exists from start
    # Updates execution_markdown in-place during streaming
```

Our implementation now follows the same pattern:

1. **Container exists from start** (pre-populated buffer)
2. **Updates in-place** (replaces buffer content)
3. **No accumulation** (formatted plan replaces placeholder)

## Testing

```bash
cd /Users/sraradhy/cisco/eti/sre/cnoe/community-plugins/workspaces/agent-forge
yarn dev
```

**Expected behavior**:

1. ✅ Send any message
2. ✅ Execution plan container appears **immediately** (< 100ms)
3. ✅ Shows "_Preparing execution plan..._" placeholder
4. ✅ Container auto-expands (visible without clicking)
5. ✅ Real plan replaces placeholder when available
6. ✅ Status emojis update in-place (📋 → ⏳ → ✅)
7. ✅ No duplicate headers
8. ✅ No accumulation of old plans

---

**Status**: ✅ FIXED
**Pattern**: ✅ Matches agent-chat-cli
**Linting**: ✅ Clean

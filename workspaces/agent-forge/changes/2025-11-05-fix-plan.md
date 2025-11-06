# Fix Plan Based on agent-chat-cli Code Analysis

## What I Found in agent-chat-cli Code

### Key Behaviors:

1. **NO Pre-population** (Line 593)

   ```python
   execution_markdown = ""  # Starts empty!
   ```

2. **Panel Only Shows When Content Arrives** (Line 326)

   ```python
   if execution_markdown:  # Only creates panel if non-empty
       panels.append(Panel(...))
   ```

3. **Spinner Shows First** (Lines 694-700)

   - Spinner runs while agent is thinking
   - **Stops** when first `execution_plan_update` arrives
   - Then execution plan panel appears

4. **`execution_plan_streaming` is IGNORED** (Lines 718-719)

   ```python
   if artifact_name == 'execution_plan_streaming':
       continue  # Does nothing!
   ```

5. **Only `execution_plan_update` and `execution_plan_status_update` Matter**
   - Both call `format_execution_plan_text()` which REPLACES content
   - Both call `update_live()` to refresh display

## What agent-forge is Doing WRONG

### ❌ Problem 1: Pre-populating with Placeholder

**Lines 1290-1316** - Adding placeholder immediately:

```typescript
setExecutionPlanBuffer(prev => {
  return newMessage.messageId
    ? {
        [newMessage.messageId]:
          '📋 **Execution Plan**\n\n_Preparing execution plan..._',
      }
    : {};
});
```

**Why Wrong**: agent-chat-cli shows **NOTHING** until first update arrives!

### ❌ Problem 2: Handling `execution_plan_streaming`

**Lines 1940-1970** - Trying to format and update:

```typescript
if (event.artifact?.name === 'execution_plan_streaming') {
  // ... tries to format and update buffer ...
}
```

**Why Wrong**: agent-chat-cli **IGNORES** this artifact completely!

### ✅ What's RIGHT

- Lines 1971-2007: `execution_plan_update` and `execution_plan_status_update` handlers
- Line 1955: Uses `formatExecutionPlanText()` correctly
- Lines 1964-1967: Replaces buffer content (not accumulates)

## Required Fixes

### 1. ✅ REMOVE Pre-population with Placeholder

**Change lines 1290-1316 to**:

```typescript
// DON'T pre-populate! Let it show only when first update arrives
setExecutionPlanBuffer({}); // Clear old, but don't add placeholder
setAutoExpandExecutionPlans(new Set()); // Clear auto-expand
```

### 2. ✅ IGNORE `execution_plan_streaming`

**Change lines 1940-1970 to**:

```typescript
if (event.artifact?.name === 'execution_plan_streaming') {
  // agent-chat-cli ignores this completely
  console.log('📋 Ignoring execution_plan_streaming (not used)');
  continue;
}
```

### 3. ✅ Auto-expand ONLY on First Update

**In `execution_plan_update` handler (around line 1975)**:

```typescript
if (
  artifact_name === 'execution_plan_update' ||
  artifact_name === 'execution_plan_status_update'
) {
  const formattedPlan = formatExecutionPlanText(completePlan);

  setExecutionPlanBuffer(prevBuffer => ({
    ...prevBuffer,
    [activeMessageId]: formattedPlan,
  }));

  // Auto-expand ONLY on first update (when buffer was empty for this message)
  setAutoExpandExecutionPlans(prevSet => {
    const newSet = new Set(prevSet);
    if (!newSet.has(activeMessageId)) {
      newSet.add(activeMessageId);
    }
    return newSet;
  });

  // Clear loading state
  setExecutionPlanLoading(prevLoading => {
    const newSet = new Set(prevLoading);
    newSet.delete(activeMessageId);
    return newSet;
  });
}
```

## Expected User Experience (Matching agent-chat-cli)

```
[User: "show weather in SFO"]
  ↓
🔄 Spinner: "Agent is thinking..."  ← isInOperationalMode = false, normal spinner
  ↓
📡 execution_plan_update arrives
  ↓
🛑 Spinner: Shows last status message (tool notification or status)
  ↓
📋 **Execution Plan** container appears (animated in)

   - 📋 Call weather API
   - 📋 Format response
  ↓
📡 execution_plan_status_update arrives
  ↓
🔄 Content REPLACES (in-place):

   - ⏳ Call weather API        ← Changed!
   - 📋 Format response
  ↓
📡 tool_notification_start
  ↓
🔄 Spinner: "🔧 Weather: Calling tool..."
  ↓
📡 execution_plan_status_update arrives
  ↓
🔄 Content REPLACES:

   - ✅ Call weather API        ← Changed!
   - ⏳ Format response         ← Changed!
```

## Testing Checklist

After fixes, test these queries:

1. ✅ "show weather in SFO"
2. ✅ "list all pods in default namespace"
3. ✅ "create a new deployment"

Verify:

- ❌ NO placeholder text appears
- ✅ Execution plan container appears ONLY when first update arrives
- ✅ Single header "📋 **Execution Plan**"
- ✅ Status emojis update in-place: 📋 → ⏳ → ✅
- ✅ No duplicate plans
- ✅ No accumulation
- ✅ Spinner shows tool notifications while plan is visible

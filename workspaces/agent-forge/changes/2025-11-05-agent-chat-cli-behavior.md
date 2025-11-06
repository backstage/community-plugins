# Agent-Chat-CLI Execution Plan Behavior Analysis

## How agent-chat-cli Handles Execution Plans

### 1. **Initialization** (Line 593)

```python
execution_markdown = ""  # Empty string
```

### 2. **Dashboard Built from Start** (Line 604)

```python
with Live(build_dashboard(execution_markdown, tool_markdown, response_markdown, streaming_markdown), ...):
```

**Important**: `build_dashboard()` checks `if execution_md:` (line 326), so:

- If `execution_markdown == ""`, **NO panel is shown**
- Panel only appears when execution_markdown has content

### 3. **When `execution_plan_update` Arrives** (Lines 690-702)

```python
if artifact_name == 'execution_plan_update':
    if text:
        execution_markdown = format_execution_plan_text(text)  # ← REPLACES (not appends!)
        # Stop spinner when we first show the execution plan
        if not spinner_stopped:
            notify_streaming_started()
            await wait_spinner_cleared()
            spinner_stopped = True
        update_live()  # ← Refreshes dashboard with new execution_markdown
    continue
```

**Key Points**:

- ✅ **REPLACES** entire `execution_markdown` (not accumulates)
- ✅ Stops spinner on first update
- ✅ Calls `update_live()` to refresh display
- ✅ `continue` to skip adding to streaming buffer

### 4. **When `execution_plan_status_update` Arrives** (Lines 704-716)

```python
if artifact_name == 'execution_plan_status_update':
    if text:
        execution_markdown = format_execution_plan_text(text)  # ← REPLACES again!
        # Stop spinner when we first show the execution plan
        if not spinner_stopped:
            notify_streaming_started()
            await wait_spinner_cleared()
            spinner_stopped = True
        update_live()
    continue
```

**Same behavior**: Replaces content, updates display

### 5. **When `execution_plan_streaming` Arrives** (Lines 718-719)

```python
if artifact_name == 'execution_plan_streaming':
    continue  # ← IGNORED! Does nothing!
```

**Important**: `execution_plan_streaming` is **completely ignored** in agent-chat-cli!

### 6. **`format_execution_plan_text()` Function** (Lines 161-207)

```python
def format_execution_plan_text(raw_text: str) -> str:
    """Format execution plan text into a user-friendly markdown checklist."""
    if not raw_text:
        return raw_text

    # If it already contains bullet emojis, assume it's formatted
    stripped = raw_text.strip()
    if stripped.startswith('- ✅') or stripped.startswith('✅') or '📋' in stripped:
        return raw_text

    heading = "📋 **Execution Plan**"
    if 'Updated' in raw_text and 'todo list' in raw_text:
        heading = "📋 **Execution Plan (updated)**"

    list_start = raw_text.find('[')
    list_end = raw_text.rfind(']')
    if list_start == -1 or list_end == -1 or list_end <= list_start:
        return raw_text

    list_segment = raw_text[list_start:list_end + 1]

    try:
        todos = ast.literal_eval(list_segment)  # ← Parses Python list syntax
        if not isinstance(todos, list):
            return raw_text
    except Exception:
        return raw_text

    status_emoji = {
        'in_progress': '⏳',
        'completed': '✅',
        'pending': '📋',
    }

    lines = [heading, ""]
    for item in todos:
        if not isinstance(item, dict):
            continue
        content = item.get('content') or item.get('task') or "(no description)"
        status = (item.get('status') or '').lower()
        emoji = status_emoji.get(status, '•')
        lines.append(f"- {emoji} {content}")

    if len(lines) <= 2:
        return raw_text

    return "\n".join(lines)
```

**Key Points**:

- Uses `ast.literal_eval()` (Python) vs `JSON.parse()` (JavaScript)
- Detects if already formatted (has emojis) and returns as-is
- Creates single "📋 **Execution Plan**" header
- Maps status to emoji: pending → 📋, in_progress → ⏳, completed → ✅

## User Experience Flow

### Timeline:

```
[User sends: "show weather in SFO"]
  ↓
⏰ Spinner shows: "Agent is thinking..."
  ↓
📡 execution_plan_update arrives with JSON:
   [{"content": "Call weather API", "status": "pending"},
    {"content": "Format response", "status": "pending"}]
  ↓
🛑 Spinner stops
  ↓
📋 **Execution Plan** panel appears:

   📋 **Execution Plan**

   - 📋 Call weather API
   - 📋 Format response
  ↓
📡 execution_plan_status_update arrives:
   [{"content": "Call weather API", "status": "in_progress"},
    {"content": "Format response", "status": "pending"}]
  ↓
🔄 Panel content REPLACES (in-place update):

   📋 **Execution Plan**

   - ⏳ Call weather API        ← Changed!
   - 📋 Format response
  ↓
📡 execution_plan_status_update arrives again:
   [{"content": "Call weather API", "status": "completed"},
    {"content": "Format response", "status": "in_progress"}]
  ↓
🔄 Panel content REPLACES again:

   📋 **Execution Plan**

   - ✅ Call weather API        ← Changed!
   - ⏳ Format response         ← Changed!
  ↓
... continues until all tasks complete ...
```

## What Agent-Forge Should Do

### Current Issues to Fix:

1. ✅ **Pre-population** (Already fixed in lines 1290-1316)
   - Show execution plan container immediately with placeholder
2. ⚠️ **Possible Issue**: `execution_plan_streaming` handling

   - Lines 1940-1970 try to format and update buffer
   - But agent-chat-cli **ignores** this artifact completely!
   - This might cause duplicate or incorrect updates

3. ⚠️ **Formatting Function**

   - Lines 462-509 use `JSON.parse()` (correct for JavaScript)
   - Should handle same format as agent-chat-cli

4. ✅ **Replacement not Accumulation** (Already fixed in lines 1971-2007)
   - Uses formatted plan to replace buffer content

### Recommended Changes:

1. **Remove `execution_plan_streaming` handling** or make it no-op
2. **Only use `execution_plan_update` and `execution_plan_status_update`**
3. **Verify format_execution_plan_text works with actual agent output**

### Testing Needed:

Run these queries in agent-forge and verify:

- "show weather in SFO"
- "list all pods in default namespace"
- "create a new deployment"

Check that:

- ✅ Execution plan appears immediately (with placeholder or first update)
- ✅ Single header "📋 **Execution Plan**"
- ✅ Status emojis update: 📋 → ⏳ → ✅
- ✅ No duplicate plans
- ✅ No accumulation
- ✅ Container stays expanded while streaming

# Streaming Improvements from agent-chat-cli

This document describes the awesome streaming improvements implemented in `agent-chat-cli` that should be replicated in `agent-forge`.

## Overview

The agent-chat-cli has implemented a sophisticated streaming display system that handles multiple types of artifacts with real-time updates and beautiful UI feedback.

## Key Artifact Types

### 1. Tool Notifications

#### `tool_notification_start`

- **Purpose**: Indicates a tool/operation is starting
- **Display**: Show with ⏳ emoji
- **Handling**: Summarize to first 160 characters, track in a "Tool Activity" panel
- **Example**: `⏳ Calling search_codebase tool...`

#### `tool_notification_end`

- **Purpose**: Indicates a tool/operation has completed
- **Display**: Show with ✅ emoji
- **Handling**: Summarize to first 160 characters, add to activity panel
- **Example**: `✅ Search completed successfully`

**Implementation Details (agent-chat-cli lines 710-730)**:

```python
if artifact_name == 'tool_notification_start' and text:
    notification_text = summarize_tool_notification(text)
    if notification_text and notification_text not in tool_seen:
        tool_seen.add(notification_text)
        tool_entries.append(f"⏳ {notification_text}")
        recent = tool_entries[-8:]  # Keep last 8
        tool_markdown = "\n".join(f"- {line}" for line in recent)
        update_live()
    continue  # Don't add to streaming output

if artifact_name == 'tool_notification_end' and text:
    completion_text = summarize_tool_notification(text)
    if completion_text and completion_text not in tool_seen:
        tool_seen.add(completion_text)
        tool_entries.append(f"✅ {completion_text}")
        recent = tool_entries[-8:]
        tool_markdown = "\n".join(f"- {line}" for line in recent)
        update_live()
    continue
```

**Summarization Function (lines 210-229)**:

```python
def summarize_tool_notification(raw_text: str) -> str:
    if not raw_text:
        return ""

    text = raw_text.strip()
    if "response=" in text:
        text = text.split("response=", 1)[0].strip()

    # Get first line only
    lines = text.splitlines()
    if lines:
        text = lines[0].strip()
    else:
        return ""

    max_len = 160
    if len(text) > max_len:
        text = text[:max_len].rstrip() + "…"

    return text
```

### 2. Execution Plan Artifacts

#### `execution_plan_update`

- **Purpose**: Complete execution plan update (replaces previous)
- **Display**: Format as markdown checklist with emojis
- **Handling**: Parse TODO list format, display immediately

#### `execution_plan_status_update`

- **Purpose**: Status update for execution plan
- **Display**: Same as execution_plan_update
- **Handling**: Update the existing plan display

#### `execution_plan_streaming`

- **Purpose**: Incremental chunks of execution plan
- **Display**: Accumulate and show in real-time
- **Handling**: Skip text extraction (already handled separately)

**Implementation Details (lines 695-708)**:

```python
if artifact_name == 'execution_plan_update':
    if text:
        execution_markdown = format_execution_plan_text(text)
        update_live()
    continue

if artifact_name == 'execution_plan_status_update':
    if text:
        execution_markdown = format_execution_plan_text(text)
        update_live()
    continue

if artifact_name == 'execution_plan_streaming':
    continue  # Skip, handled elsewhere
```

**Formatting Function (lines 161-207)**:

```python
def format_execution_plan_text(raw_text: str) -> str:
    """Format execution plan text into a user-friendly markdown checklist."""
    if not raw_text:
        return raw_text

    # If already formatted, return as-is
    stripped = raw_text.strip()
    if stripped.startswith('- ✅') or stripped.startswith('✅') or '📋' in stripped:
        return raw_text

    heading = "📋 **Execution Plan**"
    if 'Updated' in raw_text and 'todo list' in raw_text:
        heading = "📋 **Execution Plan (updated)**"

    # Extract list from text
    list_start = raw_text.find('[')
    list_end = raw_text.rfind(']')
    if list_start == -1 or list_end == -1:
        return raw_text

    list_segment = raw_text[list_start:list_end + 1]

    try:
        todos = ast.literal_eval(list_segment)
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

### 3. Partial Result

#### `partial_result`

- **Purpose**: Contains the final complete result after streaming
- **Display**: Use as the final displayed message
- **Handling**: Sanitize to remove status payloads, use after streaming completes

**Implementation Details (lines 681-693)**:

```python
if artifact_name == 'partial_result':
    debug_log(f"Step 2: Received partial_result event with {len(text)} chars")
    if text:
        partial_result_text = sanitize_stream_text(text)
        debug_log(f"Step 2: After sanitization: {len(partial_result_text)} chars")
        # Store for use after Live context exits
        # DON'T display immediately - wait until streaming completes
    update_live()
    continue
```

**Sanitization Function (lines 232-263)**:

```python
def sanitize_stream_text(raw_text: str) -> str:
    """Remove status payloads and extract meaningful streaming text."""
    if not raw_text:
        return ""

    text = raw_text.replace("\r", "")

    # Try direct JSON decode to check for status messages
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            # Skip status-only messages
            if set(data.keys()) == {'state', 'message'}:
                return ""
            # Extract actual content if present
            if 'content' in data:
                return data['content']
    except (json.JSONDecodeError, ValueError):
        pass

    # Remove common status patterns
    if text.startswith('{"state":') or text.startswith('{"status":'):
        return ""

    return text.strip()
```

### 4. Streaming Result

#### `streaming_result`

- **Purpose**: Real-time text content as it's generated
- **Display**: Show immediately in streaming panel
- **Handling**: Accumulate and display progressively

## UI Layout (agent-chat-cli)

The CLI uses a live dashboard with multiple panels:

```
┌────────────────────────────────────────────┐
│ 📋 Execution Plan                          │
│ - ⏳ Task 1 (in_progress)                  │
│ - 📋 Task 2 (pending)                      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 🔧 Tool Activity                           │
│ - ⏳ Calling search_codebase...            │
│ - ✅ Search completed                      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 💬 Response                                │
│ [Streaming text appears here in real-time] │
└────────────────────────────────────────────┘
```

## Key Implementation Patterns

### 1. Separate Artifact Handling

```python
# Extract artifact name early
artifact_name = None
if hasattr(event, 'artifact') and event.artifact:
    artifact_name = event.artifact.name

# Handle each artifact type explicitly
if artifact_name == 'tool_notification_start':
    # Handle tool start
    continue  # Don't add to streaming buffer

if artifact_name == 'tool_notification_end':
    # Handle tool end
    continue

if artifact_name == 'execution_plan_update':
    # Handle execution plan
    continue

if artifact_name == 'partial_result':
    # Store for final display
    continue

# Only streaming_result reaches here
if text and artifact_name:
    # Add to streaming buffer
```

### 2. Deduplication

```python
# Track seen notifications
tool_seen = set()
if notification_text and notification_text not in tool_seen:
    tool_seen.add(notification_text)
    # Process notification
```

### 3. Live Updates

```python
def update_live():
    live.update(build_dashboard(
        execution_markdown,
        tool_markdown,
        response_markdown,
        streaming_markdown
    ))

# Call after each change
execution_markdown = format_execution_plan_text(text)
update_live()
```

## What Needs to Change in agent-forge

### Current State

- ✅ Already handles `execution_plan_streaming`
- ✅ Already handles `execution_plan_update`
- ⚠️ Tool notifications handled via `detectToolNotification()` pattern matching
- ❌ No explicit handling of `tool_notification_start/end` artifacts
- ❌ No handling of `partial_result` artifact
- ❌ No visual tool activity panel

### Required Changes

1. **Add explicit artifact name handling**:

   - Check for `tool_notification_start` artifact name
   - Check for `tool_notification_end` artifact name
   - Check for `partial_result` artifact name

2. **Add tool activity state**:

   - Track active tool operations with start/end pairs
   - Display in a collapsible "Tool Activity" section
   - Show last 8-10 tool notifications

3. **Add partial_result handling**:

   - Store partial_result text separately
   - Use as final message content after streaming completes
   - Prefer partial_result over accumulated streaming text

4. **Improve execution plan formatting**:

   - Parse TODO list format from execution_plan_update
   - Format with proper emojis (📋/⏳/✅)
   - Show as structured markdown list

5. **Update UI**:
   - Add "Tool Activity" panel similar to execution plan
   - Show tool notifications with emojis
   - Auto-collapse after completion

## Testing

Test with queries that:

1. Use multiple tools (to see tool_notification_start/end)
2. Create execution plans (to see execution_plan_update)
3. Generate long responses (to see partial_result vs streaming_result)

Example test query:

```
"Search the codebase for authentication logic and create a plan to refactor it"
```

This should trigger:

- ⏳ Calling search_codebase tool
- ✅ Search completed
- 📋 Execution Plan with multiple tasks
- 💬 Streaming response
- ⭐ Final partial_result

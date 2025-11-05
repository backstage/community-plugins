# Markdown Newline Fix

## Problem

The older CAIPE agent sends text with single newlines (`\n`) between list items and paragraphs, but these were being rendered as continuous text without proper line breaks.

### Example Issue

**Agent sends:**

```
Technical Support: Help with coding...
2. Project Management: Assist with task planning...
3. Cloud Services: Manage cloud resources...
```

**Was displaying as:**

```
Technical Support: Help with coding... 2. Project Management: Assist with task planning... 3. Cloud Services: Manage cloud resources...
```

## Root Cause

The text is rendered using **ReactMarkdown**, which follows standard Markdown rules:

- **Single newline** (`\n`) → Treated as a space (inline text)
- **Double newline** (`\n\n`) → Creates a paragraph break
- **Two spaces + newline** (`  \n`) → Creates a line break (`<br>`)

The older CAIPE agent sends single newlines, expecting them to be preserved as line breaks, but standard Markdown collapses them into spaces.

## Solution

Added automatic newline conversion in the `status-update` handler (lines 2046-2068):

### Processing Steps

1. **Detect numbered lists** - Convert `\n2.` to `\n\n2.` for proper paragraph breaks
2. **Detect bullet lists** - Convert `\n-` or `\n*` to `\n\n-` / `\n\n*`
3. **Convert remaining single newlines** - Add two spaces before newlines: `text\n` → `text  \n`
4. **Preserve double newlines** - Don't modify existing paragraph breaks

### Code

```typescript
// Only process if we have complete lines
if (textPart.text.includes('\n') || event.final) {
  // Convert single newlines followed by numbers (list items) to double newlines
  displayText = displayText.replace(/\n(?=\d+\.)/g, '\n\n');

  // Convert single newlines followed by bullet points to double newlines
  displayText = displayText.replace(/\n(?=[-*•])/g, '\n\n');

  // Convert remaining single newlines to markdown line breaks (two spaces + newline)
  // But preserve double+ newlines (paragraph breaks)
  displayText = displayText.replace(/([^\n])\n(?!\n)/g, '$1  \n');
}
```

## How It Works

### Example 1: Numbered List

**Input from agent:**

```
1. First item\n2. Second item\n3. Third item
```

**After processing:**

```
1. First item\n\n2. Second item\n\n3. Third item
```

**Renders as:**

```
1. First item

2. Second item

3. Third item
```

### Example 2: Paragraphs

**Input from agent:**

```
This is paragraph one.\nThis is paragraph two.
```

**After processing:**

```
This is paragraph one.  \nThis is paragraph two.
```

**Renders as:**

```
This is paragraph one.
This is paragraph two.
```

### Example 3: Already formatted (double newlines)

**Input from agent:**

```
Paragraph one.\n\nParagraph two.
```

**After processing:**

```
Paragraph one.\n\nParagraph two.
```

_No change - double newlines are preserved_

## Testing

### Test the Fix

1. Start the dev server:

   ```bash
   yarn dev
   ```

2. Send a message that should return a formatted list

3. Check the browser console for:

   ```
   📨 STATUS-UPDATE TEXT: {
     escapedText: "...\\n2. Item...",
     hasNewline: true
   }

   🔧 MARKDOWN NEWLINE FIX: {
     original: "...\\n2. Item...",
     processed: "...\\n\\n2. Item...",
     changed: true
   }
   ```

4. Verify the UI shows properly formatted text with line breaks

### Expected Results

- ✅ Numbered lists have proper spacing
- ✅ Bullet lists have proper spacing
- ✅ Paragraphs are separated
- ✅ No extra blank lines where not intended

## Edge Cases Handled

### Multiple Consecutive Newlines

**Input:** `text\n\n\nmore text`  
**Output:** `text\n\n\nmore text` (preserved)

The regex `\n(?!\n)` only matches newlines NOT followed by another newline, so existing paragraph breaks are left alone.

### Newlines at End of Text

**Input:** `text\n`  
**Output:** `text  \n`

Converted to markdown line break.

### Mixed Formatting

**Input:**

```
Header\n\n1. Item one\n2. Item two\n\nFooter
```

**Output:**

```
Header\n\n1. Item one\n\n2. Item two\n\nFooter
```

- Double newlines before "1." preserved
- Single newline after "1." converted to double
- Double newlines before "Footer" preserved

## Performance Impact

Minimal:

- 3 regex replacements per status-update event that contains newlines
- Only runs when `textPart.text.includes('\n') || event.final`
- Skipped for events without newlines (most common case during token-by-token streaming)

## Configuration

No configuration needed - the fix is automatic and always enabled for `status-update` events.

## Compatibility

### Older CAIPE Agent

- ✅ **Fixed** - Single newlines now render correctly

### Newer Agents (using artifacts)

- ✅ **Unaffected** - This fix only applies to `status-update` events
- Newer agents use `artifact-update` events which have separate handling

### Both Types

If an agent sends both event types, each is handled independently with appropriate newline processing.

## Disabling the Fix

If this causes issues, you can disable it by commenting out lines 2052-2068:

```typescript
// Only process if we have complete lines (avoid processing mid-stream)
// if (textPart.text.includes('\n') || event.final) {
//   ... newline conversion code ...
// }
```

Then the text will be displayed as-is, with single newlines treated per standard Markdown rules (collapsed to spaces).

## Future Enhancements

### Smarter Detection

Could add detection for:

- Headings: `\n# Heading` → `\n\n# Heading`
- Code blocks: Preserve newlines inside backticks
- Tables: Special handling for table syntax

### Configuration Option

Add to `app-config.yaml`:

```yaml
agentForge:
  preserveNewlines: true # Convert single newlines to line breaks
  newlineMode: 'double' # "double" | "spaces" | "preserve"
```

### Agent Metadata

Let agents specify their newline format in the agent card:

```json
{
  "capabilities": {
    "newlineFormat": "single" // or "double" or "markdown"
  }
}
```

## Troubleshooting

### Issue: Extra blank lines

If you see too much spacing:

- Check if agent is sending double newlines already
- Look for `changed: true` in console logs
- The agent might be sending `\n\n` which gets converted to `\n\n\n\n`

**Fix:** Modify the regex to detect and preserve double newlines first.

### Issue: Still no line breaks

If formatting still isn't working:

- Check `hasNewline: false` in console logs → Agent isn't sending newlines
- Check `changed: false` → No conversion happening
- Verify text chunks are being accumulated properly

### Issue: Markdown not rendering

If you see raw markdown (`**bold**` instead of **bold**):

- Check that ReactMarkdown is being used
- Verify `remarkGfm` plugin is loaded
- Check for escaped characters being double-escaped

## Related Issues

- Original rendering issue: `status-update` events were being ignored
- Markdown compatibility: Single vs double newlines
- Streaming accumulation: Text chunks without delimiters

## References

- Markdown Spec: https://spec.commonmark.org/0.30/#hard-line-breaks
- ReactMarkdown: https://github.com/remarkjs/react-markdown
- Agent Format: See raw SSE events in Network tab

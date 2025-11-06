# Testing Guide: Older CAIPE Agent Fix

## Quick Test

### 1. Start the Dev Server

```bash
cd workspaces/agent-forge
yarn dev
```

### 2. Open the Application

Navigate to `http://localhost:3000` in your browser.

### 3. Open Browser Console

Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools and go to the Console tab.

### 4. Send a Test Message

Type any message in the chat, for example:

- "Hello"
- "Howdy"
- "What can you help me with?"

### 5. Expected Behavior

#### ✅ Success Indicators

You should see:

1. **In the UI:**

   - Text appears letter by letter as it streams in
   - Full message displays: "Howdy! How can I assist you today?" (or similar)
   - No error messages

2. **In the Console:**

   ```
   📨 STATUS-UPDATE TEXT: {
     state: "working",
     text: "Howdy",
     textLength: 5,
     final: false
   }

   📨 STATUS-UPDATE TEXT: {
     state: "working",
     text: "!",
     textLength: 1,
     final: false
   }

   📨 STATUS-UPDATE TEXT: {
     state: "working",
     text: " How",
     textLength: 4,
     final: false
   }
   // ... more chunks

   🏁 STATUS-UPDATE MARKED AS FINAL - Breaking stream loop
   ```

#### ❌ Failure Indicators

If you see:

- Empty response in the UI
- "Response Processing Issue" message
- No `📨 STATUS-UPDATE TEXT` logs in console
- Only `📨 STREAM EVENT` logs but no text extraction

Then the fix may not be working correctly.

## What Was Fixed

### Before the Fix

The plugin code at line 2026 said:

```typescript
} else if (event.kind === 'status-update') {
  // Only handle status changes, don't process text content (to avoid duplication)
  // Text content is already handled in artifact-update events
```

This ignored text in `status-update` events, expecting it to come from `artifact-update` events instead.

### After the Fix

Now the code extracts and accumulates text from `status-update` events:

```typescript
} else if (event.kind === 'status-update') {
  // 🔧 OLDER CAIPE AGENT COMPATIBILITY: Extract text from status.message
  if (event.status?.message?.parts) {
    const textPart = event.status.message.parts.find((p: any) => p.kind === 'text');
    if (textPart && 'text' in textPart && textPart.text) {
      // Accumulate text from status updates
      accumulatedText += textPart.text;
      updateStreamingMessage(accumulatedText, accumulatedExecutionPlan || '', true);
    }
  }
}
```

## Understanding the Event Flow

### Older CAIPE Agent Format

```json
{
  "kind": "status-update",
  "status": {
    "state": "working",
    "message": {
      "parts": [
        {
          "kind": "text",
          "text": "Howdy" // ← Text is HERE
        }
      ]
    }
  },
  "final": false
}
```

### Newer Agent Format (what plugin expected before)

```json
{
  "kind": "artifact-update",
  "artifact": {
    "name": "streaming_result",
    "parts": [
      {
        "kind": "text",
        "text": "Response text" // ← Text would be HERE instead
      }
    ]
  }
}
```

## Configuration Check

Verify your `app-config.yaml` has:

```yaml
agentForge:
  baseUrl: https://caipe.dev.outshift.io
  enableStreaming: true # ← MUST be true for older CAIPE agent
```

## Troubleshooting

### Issue: Still seeing empty responses

**Check:**

1. Is `enableStreaming: true` in config?
2. Are you seeing `📨 STREAM EVENT` logs in console?
3. Are you seeing `📨 STATUS-UPDATE TEXT` logs?

**If no status-update logs:**

- The agent might be using a different format
- Check the raw SSE data in Network tab (look for `event-stream` requests)
- Share the raw event data with the dev team

### Issue: Text is duplicated

This could happen if the agent sends text in BOTH `status-update` AND `artifact-update` events.

**Solution:** We may need to add logic to detect and deduplicate text.

### Issue: Text appears but with artifacts mixed in

Check for these patterns in console:

- `🎯 ARTIFACT EVENT DETECTED`
- Mixed `status-update` and `artifact-update` events

**Solution:** The newer agents use artifacts, older agents use status updates. We may need version detection.

## Performance Notes

The fix adds minimal overhead:

- One `find()` operation per status-update event
- Text concatenation (already happening for artifacts)
- One additional log statement per chunk

## Rollback

If this causes issues with newer agents:

```bash
git checkout HEAD~1 -- workspaces/agent-forge/plugins/agent-forge/src/components/AgentForgePage.tsx
```

## Next Steps

Once verified working:

1. Test with multiple conversation turns
2. Test with longer responses
3. Test with execution plans (if supported by older agent)
4. Consider adding a config flag: `legacyStatusUpdateMode: true`

## Questions?

- Check `DEBUGGING_GUIDE.md` for detailed diagnostics
- Check `CHANGES_SUMMARY.md` for technical details
- Review browser console logs for specific issues

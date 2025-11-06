# Debugging Guide: CAIPE Agent Rendering Issues

## Overview

This guide helps diagnose and fix rendering issues when the Agent Forge plugin fails to display output from the older CAIPE agent at `https://caipe.dev.outshift.io`.

## ✅ ISSUE RESOLVED

**The rendering issue has been fixed!** The older CAIPE agent sends text in `status-update` events, but the plugin was only processing `artifact-update` events. The fix now extracts and displays text from both event types.

## Recent Changes

1. **Added comprehensive diagnostic logging** to identify compatibility issues
2. **Fixed `status-update` handler** to extract text from `event.status.message.parts` (line 2026-2049)
3. **Added real-time text accumulation** for streaming responses from older agents

## How to Test

### 1. Start the Development Server

```bash
cd workspaces/agent-forge
yarn dev
```

### 2. Open Browser Console

1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Navigate to the Console tab
3. Clear any existing logs

### 3. Send a Test Message

Send a simple message to the CAIPE agent, such as:

- "Hello"
- "What can you help me with?"

### 4. Review Console Logs

Look for the following diagnostic log entries:

#### Expected Log Sequence:

```
📦 NON-STREAMING TASK RESULT RECEIVED: {
  state: "completed" | "working" | "submitted",
  hasArtifacts: true/false,
  artifactsCount: 0,
  artifactNames: [...],
  hasStatusMessage: true/false,
  hasHistory: true/false,
  historyCount: 0,
  fullTaskResult: "..." // Full JSON response from agent
}
```

This log will show you **exactly** what the older CAIPE agent is returning.

## Common Issues and Solutions

### Issue 1: No Artifacts Found

**Symptoms:**

- `hasArtifacts: false` or `artifactsCount: 0`
- Plugin falls back to checking `status.message`

**Solution:**
The older CAIPE agent might not be using the `artifacts` field. The code will automatically try alternative fields.

### Issue 2: No Status Message

**Symptoms:**

- `hasStatusMessage: false`
- State is "working" or "submitted"

**Solution:**
The code will fall back to parsing the `history` field. Check the history parsing logs:

```
🎯 FALLING BACK TO HISTORY PARSING: {
  historyLength: ...,
  historyRoles: [...]
}
```

### Issue 3: Empty History

**Symptoms:**

- `historyCount: 0` or no agent messages after last user message

**Solution:**
This indicates the agent response format has changed. You'll see:

```
❌ NO CONTENT FOUND IN RESPONSE - This indicates a compatibility issue
```

And a diagnostic message will be displayed in the UI.

## Analyzing the Full Task Result

The most important log is `fullTaskResult` in the first console log. Examine it to understand the exact structure:

### Expected A2A Task Structure:

```json
{
  "id": "task-id",
  "contextId": "context-id",
  "status": {
    "state": "completed",
    "message": {
      "role": "agent",
      "parts": [
        {
          "kind": "text",
          "text": "Response text here"
        }
      ]
    }
  },
  "artifacts": [
    {
      "artifactId": "artifact-1",
      "name": "final_result",
      "parts": [
        {
          "kind": "text",
          "text": "Response text here"
        }
      ]
    }
  ],
  "history": [
    {
      "role": "user",
      "parts": [{ "kind": "text", "text": "User question" }]
    },
    {
      "role": "agent",
      "parts": [{ "kind": "text", "text": "Agent response" }]
    }
  ]
}
```

## Response State Handling

The plugin checks for content in this order:

1. **Artifacts** (for `state === "completed"`)

   - Looks for artifact named `final_result`
   - Falls back to last artifact if not found

2. **Status Message** (for `completed`, `failed`, `rejected`, `canceled`, `auth-required`)

   - Uses `status.message.parts[0].text`

3. **History** (fallback for all other cases)
   - Finds last user message
   - Collects all agent messages after that
   - Filters out tool notification messages

## Compatibility Fixes Needed

Based on the console logs, you may need to implement one of these fixes:

### Fix 1: Add Support for Alternative Response Field

If the older CAIPE agent uses a different field name:

```typescript
// Add after line 2251 in AgentForgePage.tsx
if (!resultText && taskResult.someOtherField) {
  // Extract text from alternative field
  resultText = taskResult.someOtherField.text;
}
```

### Fix 2: Handle Different State Values

If the agent returns non-standard state values:

```typescript
// Modify the useStatusMessage condition around line 2222
const useStatusMessage =
  taskResult.status.state === 'completed' ||
  taskResult.status.state === 'done' || // Add alternative state names
  taskResult.status.state === 'finished' ||
  // ... existing states
```

### Fix 3: Parse History Differently

If history structure is different:

```typescript
// Modify history parsing around line 2284
// Check for alternative message structure
if (message.content) {
  agentWords.push(message.content);
}
```

## Next Steps

1. **Capture the console logs** showing the full task result structure
2. **Share the logs** with the development team
3. **Identify** which field contains the response text
4. **Implement** the appropriate compatibility fix

## Rollback Instructions

If these changes cause issues, revert the file:

```bash
git checkout HEAD -- workspaces/agent-forge/plugins/agent-forge/src/components/AgentForgePage.tsx
```

## Additional Resources

- A2A Protocol Specification: https://github.com/google-a2a/a2a-spec
- CAIPE Documentation: Check internal documentation for older agent format
- Schema Definition: `workspaces/agent-forge/plugins/agent-forge/src/a2a/schema.ts`

## Contact

If you need further assistance, provide:

1. Full console logs from the test
2. The `fullTaskResult` JSON
3. Any error messages displayed in the UI

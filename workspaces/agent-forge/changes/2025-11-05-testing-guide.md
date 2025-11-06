# Testing Guide: Execution Plan Implementation

## How to Verify agent-chat-cli Pattern Implementation

### Method 1: Manual Testing (Recommended)

#### Setup

```bash
# Terminal 1: Start agent-forge
cd /Users/sraradhy/cisco/eti/sre/cnoe/community-plugins/workspaces/agent-forge
yarn dev

# Terminal 2: Keep agent-chat-cli ready for comparison
cd /Users/sraradhy/cisco/eti/sre/cnoe/agent-chat-cli
source .venv/bin/activate
```

#### Test Queries

Run these queries in **BOTH** agent-chat-cli and agent-forge to compare:

1. **"show weather in SFO"**
2. **"list all pods in default namespace"**
3. **"create a new deployment for nginx"**
4. **"explain your routing logic"**

#### What to Observe

| Behavior                 | agent-chat-cli                    | agent-forge (Expected)            | ✅/❌ |
| ------------------------ | --------------------------------- | --------------------------------- | ----- |
| **Initial State**        | Empty (no execution plan)         | Empty (no execution plan)         |       |
| **Container Appearance** | When first update arrives         | When first update arrives         |       |
| **Placeholder Text**     | None                              | None                              |       |
| **Heading**              | "📋 **Execution Plan**"           | "📋 **Execution Plan**"           |       |
| **Updated Heading**      | "📋 **Execution Plan (updated)**" | "📋 **Execution Plan (updated)**" |       |
| **Status Emojis**        | 📋 → ⏳ → ✅                      | 📋 → ⏳ → ✅                      |       |
| **In-place Updates**     | Yes (content replaces)            | Yes (content replaces)            |       |
| **No Duplicates**        | Single plan visible               | Single plan visible               |       |
| **Auto-expand**          | On first update                   | On first update                   |       |

### Method 2: Browser DevTools Console Logging

Agent-forge has extensive console logging. Open browser DevTools and look for:

```javascript
// Should see these logs in sequence:
🧹 CLEARING EXECUTION PLAN BUFFER (agent-chat-cli pattern)
  before: []
  after: 'EMPTY'
  reason: 'New streaming message started - will populate on first update'

⏭️ IGNORING execution_plan_streaming (agent-chat-cli pattern)

📋 EXECUTION PLAN UPDATE - Updating display in real-time
🎯 STORING EXECUTION PLAN FOR MESSAGE: <messageId>
✅ EXECUTION PLAN LOADED - Removing loading state: <messageId>
🔄 AUTO-EXPANDING EXECUTION PLAN
```

#### ❌ BAD Logs (Should NOT see):

```javascript
// These would indicate bugs:
📋 PRE-POPULATED EXECUTION PLAN BUFFER  // ← Should NOT exist anymore
✅ ACCEPTING EXECUTION PLAN STREAMING CHUNK  // ← Should be ignored now
```

### Method 3: Network Tab Inspection

Open browser Network tab and filter by "EventStream" or SSE:

1. Look for streaming events from agent
2. Find `execution_plan_update` and `execution_plan_status_update` events
3. Verify agent-forge processes them correctly
4. Check that `execution_plan_streaming` events are ignored

### Method 4: Component State Inspection

Use React DevTools:

1. Find `AgentForgePage` component
2. Check state values:
   - `executionPlanBuffer`: Should be empty initially, then populated on first update
   - `autoExpandExecutionPlans`: Should be empty initially, then contain messageId on first update
   - `executionPlanLoading`: Not used in agent-chat-cli pattern

### Method 5: Screenshot Comparison

Take screenshots at these moments:

**agent-chat-cli**:

1. Initial state (after query sent, before first update)
2. After first `execution_plan_update`
3. After first `execution_plan_status_update` (with in_progress)
4. After completion

**agent-forge**:

1. Same moments as above
2. Compare side-by-side

### Method 6: Video Recording

Record both screens side-by-side:

```bash
# On Mac, use QuickTime Player:
# File → New Screen Recording
# Record both agent-chat-cli terminal and agent-forge browser
```

### Method 7: Automated Testing Script

Create a test to verify the formatting function:

```typescript
// test/formatExecutionPlanText.test.ts
describe('formatExecutionPlanText', () => {
  it('should format initial execution plan', () => {
    const input = `Created todo list with 2 tasks: [{"content": "Task 1", "status": "pending"}, {"content": "Task 2", "status": "pending"}]`;
    const output = formatExecutionPlanText(input);

    expect(output).toContain('📋 **Execution Plan**');
    expect(output).toContain('- 📋 Task 1');
    expect(output).toContain('- 📋 Task 2');
  });

  it('should format updated execution plan', () => {
    const input = `Updated todo list: [{"content": "Task 1", "status": "completed"}, {"content": "Task 2", "status": "in_progress"}]`;
    const output = formatExecutionPlanText(input);

    expect(output).toContain('📋 **Execution Plan (updated)**');
    expect(output).toContain('- ✅ Task 1');
    expect(output).toContain('- ⏳ Task 2');
  });

  it('should return as-is if already formatted', () => {
    const input = '📋 **Execution Plan**\n\n- ✅ Task 1';
    const output = formatExecutionPlanText(input);

    expect(output).toBe(input);
  });
});
```

### Method 8: E2E Testing with Playwright/Cypress

```typescript
// e2e/execution-plan.spec.ts
describe('Execution Plan Display', () => {
  it('should not show execution plan initially', async () => {
    await page.goto('http://localhost:3000');
    await page.fill('[data-testid="chat-input"]', 'show weather in SFO');
    await page.click('[data-testid="send-button"]');

    // Wait a bit but execution plan should NOT appear yet
    await page.waitForTimeout(500);
    const execPlan = await page.$('[data-testid="execution-plan"]');
    expect(execPlan).toBeNull();
  });

  it('should show execution plan when first update arrives', async () => {
    // ... send message ...

    // Wait for execution plan to appear
    await page.waitForSelector('[data-testid="execution-plan"]', {
      timeout: 5000,
    });

    const text = await page.textContent('[data-testid="execution-plan"]');
    expect(text).toContain('📋 **Execution Plan**');
    expect(text).toContain('📋'); // Should have pending emoji
  });

  it('should update execution plan in-place', async () => {
    // ... send message and wait for initial plan ...

    const initialText = await page.textContent(
      '[data-testid="execution-plan"]',
    );

    // Wait for status update
    await page.waitForTimeout(2000);

    const updatedText = await page.textContent(
      '[data-testid="execution-plan"]',
    );

    // Should have different emojis but same container
    expect(updatedText).toContain('⏳'); // in_progress
    expect(updatedText).not.toBe(initialText);

    // Should NOT have duplicate plans
    const planCount = (updatedText.match(/📋 \*\*Execution Plan\*\*/g) || [])
      .length;
    expect(planCount).toBe(1);
  });
});
```

## Quick Verification Checklist

Run through this checklist manually:

- [ ] Start agent-forge: `cd community-plugins/workspaces/agent-forge && yarn dev`
- [ ] Open browser DevTools console
- [ ] Send query: "show weather in SFO"
- [ ] Verify: No execution plan container initially (❌ if visible immediately)
- [ ] Verify: Console shows "CLEARING EXECUTION PLAN BUFFER" (✅)
- [ ] Wait for first update (1-3 seconds)
- [ ] Verify: Execution plan container appears (✅)
- [ ] Verify: Heading is "📋 **Execution Plan**" (✅)
- [ ] Verify: Tasks have 📋 emoji (pending) (✅)
- [ ] Wait for status updates
- [ ] Verify: Emojis change to ⏳ (in_progress) (✅)
- [ ] Verify: Same container updates in-place, no duplicates (✅)
- [ ] Verify: Final state shows ✅ (completed) emojis (✅)
- [ ] Verify: Console shows "IGNORING execution_plan_streaming" if that event arrives (✅)
- [ ] Verify: Header changes to "(updated)" if agent updates plan (✅)

## Regression Testing

If you make changes, always test these scenarios:

1. **Multiple consecutive queries**: Ensure old execution plans are cleared
2. **Long-running tasks**: Verify no accumulation over time
3. **Fast responses**: Ensure execution plan still shows even if brief
4. **Error cases**: What happens if JSON parsing fails?
5. **Empty responses**: What if no execution plan is sent?

## Performance Testing

Monitor these metrics:

- **Time to first execution plan**: Should match agent-chat-cli (1-3s)
- **Update latency**: In-place updates should be instant (<100ms)
- **Memory usage**: No leaks from old execution plans
- **Re-render count**: Should be minimal (only when content changes)

---

**Recommendation**: Start with **Method 1 (Manual Testing)** combined with **Method 2 (Console Logging)** for initial verification.

/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { v4 as uuidv4 } from 'uuid';

// Types for testing
interface TestMessage {
  messageId: string;
  text: string;
  isStreaming: boolean;
  isUser: boolean;
  timestamp: string;
}

interface TestSession {
  contextId: string;
  messages: TestMessage[];
}

// Extract the core logic into testable functions
class ExecutionPlanManager {
  private executionPlanBuffer: Record<string, string> = {};
  private autoExpandExecutionPlans = new Set<string>();
  private accumulatedExecutionPlan: string = ''; // Simulate React state

  // Simulate the nuclear cleanup logic
  clearAllExecutionPlanState(): void {
    this.executionPlanBuffer = {};
    this.autoExpandExecutionPlans = new Set();
    this.accumulatedExecutionPlan = ''; // 🚨 CRITICAL FIX: Reset accumulated state
  }

  // Simulate setting accumulated execution plan (like from streaming)
  setAccumulatedExecutionPlan(plan: string): void {
    this.accumulatedExecutionPlan = plan;
  }

  // Get accumulated execution plan (for testing contamination)
  getAccumulatedExecutionPlan(): string {
    return this.accumulatedExecutionPlan;
  }

  // Reset streaming flags on all messages
  resetStreamingFlags(sessions: TestSession[], currentSessionId: string): TestSession[] {
    return sessions.map(session => {
      if (session.contextId === currentSessionId) {
        const updatedMessages = session.messages.map(msg => ({
          ...msg,
          isStreaming: false
        }));
        return { ...session, messages: updatedMessages };
      }
      return session;
    });
  }

  // Create a new streaming message
  createStreamingMessage(initialText: string = ''): TestMessage {
    return {
      messageId: uuidv4(),
      text: initialText,
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true,
    };
  }

  // Find the currently streaming message
  findStreamingMessage(messages: TestMessage[]): TestMessage | undefined {
    const streamingMessages = messages.filter(msg => msg.isStreaming === true);
    return streamingMessages[streamingMessages.length - 1]; // Return newest
  }

  // Store execution plan in buffer (SIMPLIFIED - buffer only)
  storeExecutionPlan(messageId: string, executionPlan: string): void {
    if (executionPlan && executionPlan.trim()) {
      const cleanExecutionPlan = executionPlan.replace(/⟦|⟧/g, '');
      this.executionPlanBuffer[messageId] = cleanExecutionPlan;
      this.autoExpandExecutionPlans.add(messageId);
    }
  }

  // Check if message should show execution plan (SIMPLIFIED isolation logic)
  shouldShowExecutionPlan(messageId: string): boolean {
    const currentExecutionPlan = this.executionPlanBuffer[messageId] || '';
    return !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);
  }

  // Get execution plan for message (SIMPLIFIED)
  getExecutionPlan(messageId: string): string {
    return this.executionPlanBuffer[messageId] || '';
  }

  // Get the buffer for inspection
  getBuffer(): Record<string, string> {
    return { ...this.executionPlanBuffer };
  }

  // Get auto-expand set for inspection
  getAutoExpandSet(): Set<string> {
    return new Set(this.autoExpandExecutionPlans);
  }
}

describe('ExecutionPlanManager - Simplified Buffer Only', () => {
  let manager: ExecutionPlanManager;

  beforeEach(() => {
    manager = new ExecutionPlanManager();
  });

  describe('Buffer Management', () => {
    test('should store execution plan in buffer', () => {
      const messageId = 'msg-123';
      const plan = 'Task 1: Do something\nTask 2: Do another thing';

      manager.storeExecutionPlan(messageId, plan);

      expect(manager.getBuffer()[messageId]).toBe(plan);
      expect(manager.shouldShowExecutionPlan(messageId)).toBe(true);
    });

    test('should remove execution plan markers when storing', () => {
      const messageId = 'msg-123';
      const planWithMarkers = '⟦Task 1: Do something⟧';

      manager.storeExecutionPlan(messageId, planWithMarkers);

      expect(manager.getBuffer()[messageId]).toBe('Task 1: Do something');
      expect(manager.getBuffer()[messageId]).not.toContain('⟦');
      expect(manager.getBuffer()[messageId]).not.toContain('⟧');
    });

    test('should not store empty execution plans', () => {
      const messageId = 'msg-123';

      manager.storeExecutionPlan(messageId, '');

      expect(manager.getBuffer()[messageId]).toBeUndefined();
      expect(manager.shouldShowExecutionPlan(messageId)).toBe(false);
    });

    test('should not store whitespace-only execution plans', () => {
      const messageId = 'msg-123';

      manager.storeExecutionPlan(messageId, '   \n  \t  ');

      expect(manager.getBuffer()[messageId]).toBeUndefined();
      expect(manager.shouldShowExecutionPlan(messageId)).toBe(false);
    });

    test('should update existing execution plan in buffer', () => {
      const messageId = 'msg-123';

      manager.storeExecutionPlan(messageId, 'Initial plan');
      expect(manager.getBuffer()[messageId]).toBe('Initial plan');

      manager.storeExecutionPlan(messageId, 'Updated plan');
      expect(manager.getBuffer()[messageId]).toBe('Updated plan');
    });
  });

  describe('Execution Plan Isolation', () => {
    test('should only show execution plan for messages that have it in buffer', () => {
      manager.storeExecutionPlan('msg-1', 'Plan for message 1');
      manager.storeExecutionPlan('msg-2', 'Plan for message 2');

      expect(manager.shouldShowExecutionPlan('msg-1')).toBe(true);
      expect(manager.shouldShowExecutionPlan('msg-2')).toBe(true);
      expect(manager.shouldShowExecutionPlan('msg-3')).toBe(false);
    });

    test('should prevent cross-contamination between messages', () => {
      manager.storeExecutionPlan('msg-1', 'First plan');

      // Clear buffer and add new plan
      manager.clearAllExecutionPlanState();
      manager.storeExecutionPlan('msg-2', 'Second plan');

      expect(manager.shouldShowExecutionPlan('msg-1')).toBe(false);
      expect(manager.shouldShowExecutionPlan('msg-2')).toBe(true);
      expect(manager.getBuffer()['msg-1']).toBeUndefined();
    });

    test('should isolate execution plans by messageId', () => {
      manager.storeExecutionPlan('msg-1', 'Plan 1');
      manager.storeExecutionPlan('msg-2', 'Plan 2');
      manager.storeExecutionPlan('msg-3', 'Plan 3');

      expect(manager.getExecutionPlan('msg-1')).toBe('Plan 1');
      expect(manager.getExecutionPlan('msg-2')).toBe('Plan 2');
      expect(manager.getExecutionPlan('msg-3')).toBe('Plan 3');
    });
  });

  describe('Buffer Cleanup', () => {
    test('should completely clear buffer when requested', () => {
      manager.storeExecutionPlan('msg-1', 'Plan 1');
      manager.storeExecutionPlan('msg-2', 'Plan 2');

      expect(Object.keys(manager.getBuffer())).toHaveLength(2);

      manager.clearAllExecutionPlanState();

      expect(Object.keys(manager.getBuffer())).toHaveLength(0);
      expect(manager.shouldShowExecutionPlan('msg-1')).toBe(false);
      expect(manager.shouldShowExecutionPlan('msg-2')).toBe(false);
    });

    test('should clear auto-expand set when clearing state', () => {
      manager.storeExecutionPlan('msg-1', 'Plan 1');
      manager.storeExecutionPlan('msg-2', 'Plan 2');

      expect(manager.getAutoExpandSet().size).toBe(2);

      manager.clearAllExecutionPlanState();

      expect(manager.getAutoExpandSet().size).toBe(0);
    });

    test('should reset accumulated execution plan when clearing state', () => {
      manager.setAccumulatedExecutionPlan('Some accumulated plan');

      expect(manager.getAccumulatedExecutionPlan()).toBe('Some accumulated plan');

      manager.clearAllExecutionPlanState();

      expect(manager.getAccumulatedExecutionPlan()).toBe('');
    });
  });

  describe('Message State Management', () => {
    test('should reset streaming flags on all messages', () => {
      const sessions: TestSession[] = [{
        contextId: 'session-1',
        messages: [
          { messageId: 'msg-1', text: 'Message 1', isStreaming: true, isUser: false, timestamp: '10:00' },
          { messageId: 'msg-2', text: 'Message 2', isStreaming: true, isUser: false, timestamp: '10:01' },
        ]
      }];

      const updatedSessions = manager.resetStreamingFlags(sessions, 'session-1');

      expect(updatedSessions[0].messages.every(msg => msg.isStreaming === false)).toBe(true);
    });

    test('should find newest streaming message', () => {
      const messages: TestMessage[] = [
        { messageId: 'msg-1', text: 'Message 1', isStreaming: false, isUser: false, timestamp: '10:00' },
        { messageId: 'msg-2', text: 'Message 2', isStreaming: true, isUser: false, timestamp: '10:01' },
        { messageId: 'msg-3', text: 'Message 3', isStreaming: true, isUser: false, timestamp: '10:02' },
      ];

      const streamingMessage = manager.findStreamingMessage(messages);

      expect(streamingMessage?.messageId).toBe('msg-3');
    });

    test('should return undefined when no streaming messages exist', () => {
      const messages: TestMessage[] = [
        { messageId: 'msg-1', text: 'Message 1', isStreaming: false, isUser: false, timestamp: '10:00' },
        { messageId: 'msg-2', text: 'Message 2', isStreaming: false, isUser: false, timestamp: '10:01' },
      ];

      const streamingMessage = manager.findStreamingMessage(messages);

      expect(streamingMessage).toBeUndefined();
    });
  });

  describe('Auto-Expand Management', () => {
    test('should add messageId to auto-expand set when storing plan', () => {
      manager.storeExecutionPlan('msg-123', 'Test plan');

      expect(manager.getAutoExpandSet().has('msg-123')).toBe(true);
    });

    test('should not duplicate messageIds in auto-expand set', () => {
      manager.storeExecutionPlan('msg-123', 'Test plan 1');
      manager.storeExecutionPlan('msg-123', 'Test plan 2');
      manager.storeExecutionPlan('msg-123', 'Test plan 3');

      expect(manager.getAutoExpandSet().size).toBe(1);
    });

    test('should track multiple messageIds in auto-expand set', () => {
      manager.storeExecutionPlan('msg-1', 'Plan 1');
      manager.storeExecutionPlan('msg-2', 'Plan 2');
      manager.storeExecutionPlan('msg-3', 'Plan 3');

      const autoExpand = manager.getAutoExpandSet();
      expect(autoExpand.size).toBe(3);
      expect(autoExpand.has('msg-1')).toBe(true);
      expect(autoExpand.has('msg-2')).toBe(true);
      expect(autoExpand.has('msg-3')).toBe(true);
    });
  });

  describe('Integration Tests - Full Request Cycle', () => {
    test('should handle complete request-response cycle without contamination', () => {
      // Request 1
      const msg1 = manager.createStreamingMessage();
      manager.storeExecutionPlan(msg1.messageId, '⟦Plan 1: Task A⟧');
      manager.setAccumulatedExecutionPlan('Plan 1: Task A');

      expect(manager.shouldShowExecutionPlan(msg1.messageId)).toBe(true);
      expect(manager.getExecutionPlan(msg1.messageId)).toBe('Plan 1: Task A');

      // Clear state for Request 2
      manager.clearAllExecutionPlanState();

      // Request 2
      const msg2 = manager.createStreamingMessage();
      manager.storeExecutionPlan(msg2.messageId, '⟦Plan 2: Task B⟧');
      manager.setAccumulatedExecutionPlan('Plan 2: Task B');

      // Verify isolation
      expect(manager.shouldShowExecutionPlan(msg1.messageId)).toBe(false); // Old plan gone
      expect(manager.shouldShowExecutionPlan(msg2.messageId)).toBe(true);  // New plan present
      expect(manager.getExecutionPlan(msg1.messageId)).toBe('');
      expect(manager.getExecutionPlan(msg2.messageId)).toBe('Plan 2: Task B');
      expect(manager.getAccumulatedExecutionPlan()).toBe('Plan 2: Task B');
    });

    test('should handle rapid consecutive requests', () => {
      for (let i = 1; i <= 10; i++) {
        manager.clearAllExecutionPlanState();

        const msg = manager.createStreamingMessage();
        manager.storeExecutionPlan(msg.messageId, `Plan ${i}`);

        expect(Object.keys(manager.getBuffer())).toHaveLength(1);
        expect(manager.getExecutionPlan(msg.messageId)).toBe(`Plan ${i}`);
      }
    });

    test('should prevent contamination when streaming is interrupted', () => {
      // Start first request
      const msg1 = manager.createStreamingMessage();
      manager.storeExecutionPlan(msg1.messageId, 'Partial plan 1');

      // Interrupt and start second request (simulate user clicking away)
      manager.clearAllExecutionPlanState();
      const msg2 = manager.createStreamingMessage();
      manager.storeExecutionPlan(msg2.messageId, 'Complete plan 2');

      expect(manager.shouldShowExecutionPlan(msg1.messageId)).toBe(false);
      expect(manager.shouldShowExecutionPlan(msg2.messageId)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle messageId with special characters', () => {
      const messageId = 'msg-123-abc_def@test.com';
      manager.storeExecutionPlan(messageId, 'Test plan');

      expect(manager.shouldShowExecutionPlan(messageId)).toBe(true);
    });

    test('should handle very long execution plans', () => {
      const longPlan = `${'Task: '.repeat(1000)  }Final task`;
      manager.storeExecutionPlan('msg-1', longPlan);

      const retrieved = manager.getExecutionPlan('msg-1');
      expect(retrieved.length).toBeGreaterThan(6000);
      expect(retrieved).toContain('Final task');
    });

    test('should handle unicode in execution plans', () => {
      const unicodePlan = '任务 1: 做某事 🎯\n任务 2: 做另一件事 ✅';
      manager.storeExecutionPlan('msg-1', unicodePlan);

      expect(manager.getExecutionPlan('msg-1')).toBe(unicodePlan);
    });

    test('should handle empty messageId gracefully', () => {
      manager.storeExecutionPlan('', 'Test plan');

      // Empty string should still work as a key
      expect(manager.getExecutionPlan('')).toBe('Test plan');
    });

    test('should handle multiple marker pairs in plan', () => {
      const plan = '⟦Part 1⟧ Some text ⟦Part 2⟧';
      manager.storeExecutionPlan('msg-1', plan);

      expect(manager.getExecutionPlan('msg-1')).toBe('Part 1 Some text Part 2');
    });
  });

  describe('State Consistency', () => {
    test('should maintain buffer consistency after multiple operations', () => {
      manager.storeExecutionPlan('msg-1', 'Plan 1');
      expect(Object.keys(manager.getBuffer())).toHaveLength(1);

      manager.storeExecutionPlan('msg-2', 'Plan 2');
      expect(Object.keys(manager.getBuffer())).toHaveLength(2);

      manager.clearAllExecutionPlanState();
      expect(Object.keys(manager.getBuffer())).toHaveLength(0);

      manager.storeExecutionPlan('msg-3', 'Plan 3');
      expect(Object.keys(manager.getBuffer())).toHaveLength(1);
    });

    test('should maintain auto-expand consistency with buffer', () => {
      manager.storeExecutionPlan('msg-1', 'Plan 1');
      manager.storeExecutionPlan('msg-2', 'Plan 2');

      expect(manager.getBuffer()['msg-1']).toBeDefined();
      expect(manager.getAutoExpandSet().has('msg-1')).toBe(true);

      manager.clearAllExecutionPlanState();

      expect(manager.getBuffer()['msg-1']).toBeUndefined();
      expect(manager.getAutoExpandSet().has('msg-1')).toBe(false);
    });
  });
});

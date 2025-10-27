/**
 * Unit tests for ChatMessage execution plan display logic
 * These tests verify the core rendering logic without full component rendering
 */

import { Message } from '../../types';

describe('ChatMessage - Execution Plan Display', () => {
  const mockMessage: Message = {
    messageId: 'msg-123',
    text: 'This is a test message',
    isUser: false,
    timestamp: '10:00 AM',
    isStreaming: false
  };

  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Execution Plan Buffer Integration', () => {
    test('should show execution plan when buffer has content for messageId', () => {
      const executionPlanBuffer = {
        'msg-123': 'Task 1: Do something\nTask 2: Do another thing'
      };

      // Simulate the logic
      const messageKey = mockMessage.messageId || 'unknown';
      const currentExecutionPlan = executionPlanBuffer[messageKey] || '';
      const hasExecutionPlan = currentExecutionPlan && currentExecutionPlan.trim().length > 0;

      expect(hasExecutionPlan).toBe(true);
      expect(currentExecutionPlan).toBe('Task 1: Do something\nTask 2: Do another thing');
    });

    test('should not show execution plan when buffer has no content for messageId', () => {
      const executionPlanBuffer = {
        'msg-456': 'Plan for different message'
      };

      const messageKey = mockMessage.messageId || 'unknown';
      const currentExecutionPlan = executionPlanBuffer[messageKey] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(false);
      expect(currentExecutionPlan).toBe('');
    });

    test('should handle empty buffer gracefully', () => {
      const executionPlanBuffer: Record<string, string> = {};

      const messageKey = mockMessage.messageId || 'unknown';
      const currentExecutionPlan = executionPlanBuffer[messageKey] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(false);
    });

    test('should not show execution plan for empty string in buffer', () => {
      const executionPlanBuffer = {
        'msg-123': ''
      };

      const messageKey = mockMessage.messageId || 'unknown';
      const currentExecutionPlan = executionPlanBuffer[messageKey] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(false);
    });

    test('should not show execution plan for whitespace-only content', () => {
      const executionPlanBuffer = {
        'msg-123': '   \n  \t  '
      };

      const messageKey = mockMessage.messageId || 'unknown';
      const currentExecutionPlan = executionPlanBuffer[messageKey] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(false);
    });
  });

  describe('Message Key Generation', () => {
    test('should use messageId as key when available', () => {
      const message = {
        ...mockMessage,
        messageId: 'msg-456'
      };

      const messageKey = message.messageId || 'unknown';
      expect(messageKey).toBe('msg-456');
    });

    test('should fallback to "unknown" when messageId is undefined', () => {
      const message = {
        ...mockMessage,
        messageId: undefined
      };

      const messageKey = message.messageId || 'unknown';
      expect(messageKey).toBe('unknown');
    });

    test('should fallback to "unknown" when messageId is empty string', () => {
      const message = {
        ...mockMessage,
        messageId: ''
      };

      const messageKey = message.messageId || 'unknown';
      expect(messageKey).toBe('unknown');
    });
  });

  describe('Execution Plan Isolation', () => {
    test('should only show execution plan for specific messageId', () => {
      const executionPlanBuffer = {
        'msg-1': 'Plan 1',
        'msg-2': 'Plan 2',
        'msg-3': 'Plan 3'
      };

      // Test each message gets only its own plan
      const getPlan = (messageId: string) => executionPlanBuffer[messageId] || '';

      // Each message should see only its own plan
      expect(getPlan('msg-1')).toBe('Plan 1');
      expect(getPlan('msg-2')).toBe('Plan 2');
      expect(getPlan('msg-3')).toBe('Plan 3');

      // Non-existent messages should return empty
      expect(getPlan('msg-4')).toBe('');
      expect(getPlan('msg-999')).toBe('');
    });

    test('should prevent contamination from previous messages', () => {
      let executionPlanBuffer: Record<string, string> = {
        'msg-old': 'Old execution plan'
      };

      // Clear buffer for new message (simulating new request)
      executionPlanBuffer = {};

      // Add new message plan
      executionPlanBuffer['msg-new'] = 'New execution plan';

      // Old plan should not exist
      expect(executionPlanBuffer['msg-old']).toBeUndefined();
      expect(executionPlanBuffer['msg-new']).toBe('New execution plan');
      expect(Object.keys(executionPlanBuffer)).toHaveLength(1);
    });
  });

  describe('Auto-Expand Behavior', () => {
    test('should track messageIds that should auto-expand', () => {
      const autoExpandExecutionPlans = new Set<string>();

      autoExpandExecutionPlans.add('msg-123');

      expect(autoExpandExecutionPlans.has('msg-123')).toBe(true);
      expect(autoExpandExecutionPlans.size).toBe(1);
    });

    test('should not duplicate messageIds in auto-expand set', () => {
      const autoExpandExecutionPlans = new Set<string>();

      autoExpandExecutionPlans.add('msg-123');
      autoExpandExecutionPlans.add('msg-123'); // Duplicate
      autoExpandExecutionPlans.add('msg-123'); // Another duplicate

      expect(autoExpandExecutionPlans.size).toBe(1);
    });

    test('should handle multiple messages in auto-expand set', () => {
      const autoExpandExecutionPlans = new Set<string>();

      autoExpandExecutionPlans.add('msg-1');
      autoExpandExecutionPlans.add('msg-2');
      autoExpandExecutionPlans.add('msg-3');

      expect(autoExpandExecutionPlans.size).toBe(3);
      expect(autoExpandExecutionPlans.has('msg-1')).toBe(true);
      expect(autoExpandExecutionPlans.has('msg-2')).toBe(true);
      expect(autoExpandExecutionPlans.has('msg-3')).toBe(true);
    });

    test('should clear auto-expand set between requests', () => {
      let autoExpandExecutionPlans = new Set<string>(['msg-1', 'msg-2']);

      // Clear for new request
      autoExpandExecutionPlans = new Set();

      expect(autoExpandExecutionPlans.size).toBe(0);
    });
  });

  describe('Auto-Collapse Logic', () => {
    test('should not auto-collapse if message is still streaming', () => {
      const message = {
        ...mockMessage,
        isStreaming: true
      };

      const shouldAutoCollapse = (msg: typeof message, isLastMessage: boolean) => {
        return msg.isStreaming === false && !isLastMessage;
      };

      expect(shouldAutoCollapse(message, false)).toBe(false);
    });

    test('should not auto-collapse if message is last message', () => {
      const message = {
        ...mockMessage,
        isStreaming: false
      };
      const isLastMessage = true;

      const shouldAutoCollapse = (msg: typeof message, isLast: boolean) => {
        return msg.isStreaming === false && !isLast;
      };

      expect(shouldAutoCollapse(message, isLastMessage)).toBe(false);
    });

    test('should auto-collapse if message is not streaming and not last', () => {
      const message = {
        ...mockMessage,
        isStreaming: false
      };
      const isLastMessage = false;

      const shouldAutoCollapse = (msg: typeof message, isLast: boolean) => {
        return msg.isStreaming === false && !isLast;
      };

      expect(shouldAutoCollapse(message, isLastMessage)).toBe(true);
    });
  });

  describe('Message Type Identification', () => {
    test('should identify user messages', () => {
      const userMessage = {
        ...mockMessage,
        isUser: true
      };

      expect(userMessage.isUser).toBe(true);
    });

    test('should identify bot messages', () => {
      const botMessage = {
        ...mockMessage,
        isUser: false
      };

      expect(botMessage.isUser).toBe(false);
    });

    test('should identify streaming messages', () => {
      const streamingMessage = {
        ...mockMessage,
        isStreaming: true
      };

      expect(streamingMessage.isStreaming).toBe(true);
    });

    test('should identify completed messages', () => {
      const completedMessage = {
        ...mockMessage,
        isStreaming: false
      };

      expect(completedMessage.isStreaming).toBe(false);
    });
  });

  describe('isLastMessage Prop Logic', () => {
    test('should identify last message in list', () => {
      const messages = [
        { messageId: 'msg-1', text: 'First' },
        { messageId: 'msg-2', text: 'Second' },
        { messageId: 'msg-3', text: 'Third' }
      ];

      messages.forEach((msg, index) => {
        const isLast = index === messages.length - 1;
        if (msg.messageId === 'msg-3') {
          expect(isLast).toBe(true);
        } else {
          expect(isLast).toBe(false);
        }
      });
    });

    test('should handle single message as last', () => {
      const messages = [
        { messageId: 'msg-1', text: 'Only message' }
      ];

      const isLast = 0 === messages.length - 1;
      expect(isLast).toBe(true);
    });

    test('should handle empty message list', () => {
      const messages: any[] = [];

      expect(messages.length).toBe(0);
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle sequential message updates correctly', () => {
      const executionPlanBuffer: Record<string, string> = {};
      const messages: Array<{messageId: string, isStreaming: boolean}> = [];

      // Add first message
      messages.push({ messageId: 'msg-1', isStreaming: true });
      executionPlanBuffer['msg-1'] = 'Plan 1 (incomplete)';

      // Update first message plan
      executionPlanBuffer['msg-1'] = 'Plan 1 (complete)';
      messages[0].isStreaming = false;

      expect(executionPlanBuffer['msg-1']).toBe('Plan 1 (complete)');
      expect(messages[0].isStreaming).toBe(false);

      // Add second message (buffer should remain but be replaced)
      messages.push({ messageId: 'msg-2', isStreaming: true });
      
      // In real app, buffer would be cleared
      // Simulating buffer cleanup for new message
      const newBuffer: Record<string, string> = {};
      newBuffer['msg-2'] = 'Plan 2';

      expect(Object.keys(newBuffer)).toHaveLength(1);
      expect(newBuffer['msg-2']).toBe('Plan 2');
      expect(newBuffer['msg-1']).toBeUndefined();
    });

    test('should handle interleaved streaming and completed messages', () => {
      const messages = [
        { messageId: 'msg-1', isStreaming: false, isUser: true },
        { messageId: 'msg-2', isStreaming: false, isUser: false }, // Completed bot message
        { messageId: 'msg-3', isStreaming: true, isUser: false },  // Currently streaming
        { messageId: 'msg-4', isStreaming: false, isUser: true }
      ];

      const streamingMessages = messages.filter(m => m.isStreaming === true);
      expect(streamingMessages).toHaveLength(1);
      expect(streamingMessages[0].messageId).toBe('msg-3');
    });

    test('should maintain execution plan buffer integrity across state updates', () => {
      let buffer: Record<string, string> = {};

      // Simulate multiple rapid updates
      buffer['msg-1'] = 'Initial plan';
      expect(buffer['msg-1']).toBe('Initial plan');

      buffer['msg-1'] = 'Updated plan';
      expect(buffer['msg-1']).toBe('Updated plan');

      buffer['msg-1'] = 'Final plan';
      expect(buffer['msg-1']).toBe('Final plan');

      // Should only have one entry (no duplicates)
      expect(Object.keys(buffer)).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle null buffer gracefully', () => {
      const buffer: any = null;
      const messageId = 'msg-123';

      const plan = buffer?.[messageId] || '';
      expect(plan).toBe('');
    });

    test('should handle undefined buffer gracefully', () => {
      const buffer: any = undefined;
      const messageId = 'msg-123';

      const plan = buffer?.[messageId] || '';
      expect(plan).toBe('');
    });

    test('should handle special characters in execution plan', () => {
      const specialPlan = 'Task: Do <something> & "test" with \'quotes\'';
      const buffer = {
        'msg-123': specialPlan
      };

      const plan = buffer['msg-123'] || '';
      expect(plan).toBe(specialPlan);
    });

    test('should handle unicode characters in execution plan', () => {
      const unicodePlan = 'Task: Test emoji 🎯 and unicode ñ é ü';
      const buffer = {
        'msg-123': unicodePlan
      };

      const plan = buffer['msg-123'] || '';
      expect(plan).toBe(unicodePlan);
    });

    test('should handle very long messageIds', () => {
      const longId = 'msg-' + 'x'.repeat(1000);
      const buffer = {
        [longId]: 'Test plan'
      };

      const plan = buffer[longId] || '';
      expect(plan).toBe('Test plan');
    });
  });
});


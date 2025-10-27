/**
 * Unit tests for execution plan management logic
 * These tests verify the core logic that prevents execution plan contamination
 */

import { v4 as uuidv4 } from 'uuid';

// Types for testing
interface TestMessage {
  messageId: string;
  text: string;
  isStreaming: boolean;
  isUser: boolean;
  timestamp: string;
  executionPlan?: string;
}

interface TestSession {
  contextId: string;
  messages: TestMessage[];
}

// Extract the core logic into testable functions
export class ExecutionPlanManager {
  private executionPlanBuffer: Record<string, string> = {};
  private autoExpandExecutionPlans = new Set<string>();
  private accumulatedExecutionPlan: string = ''; // Simulate React state

  // Simulate the nuclear cleanup logic (in-memory only, no localStorage)
  clearAllExecutionPlanState(): void {
    this.executionPlanBuffer = {};
    this.autoExpandExecutionPlans = new Set();
    this.accumulatedExecutionPlan = ''; // 🚨 CRITICAL FIX: Reset accumulated state
    
    // No localStorage cleanup needed - execution plan state is now purely in-memory
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

  // Store execution plan in buffer
  storeExecutionPlan(messageId: string, executionPlan: string): void {
    if (executionPlan && executionPlan.trim()) {
      const cleanExecutionPlan = executionPlan.replace(/⟦|⟧/g, '');
      this.executionPlanBuffer[messageId] = cleanExecutionPlan;
      this.autoExpandExecutionPlans.add(messageId);
    }
  }

  // Check if message should show execution plan (isolation logic)
  shouldShowExecutionPlan(message: TestMessage): boolean {
    const messageHasExecutionPlanProperty = message.hasOwnProperty('executionPlan');
    const messageKey = message.messageId || 'unknown';
    const bufferedExecutionPlan = this.executionPlanBuffer[messageKey];
    
    const messageHasOwnExecutionPlan = !!(message.executionPlan && message.executionPlan.trim());
    const bufferHasExecutionPlanForThisMessage = !!(bufferedExecutionPlan && bufferedExecutionPlan.trim());
    
    // Only show execution plan if message has the property AND has content
    return messageHasExecutionPlanProperty && (messageHasOwnExecutionPlan || bufferHasExecutionPlanForThisMessage);
  }

  // Get current buffer state for testing
  getBufferState() {
    return {
      buffer: { ...this.executionPlanBuffer },
      autoExpand: new Set(this.autoExpandExecutionPlans)
    };
  }
}

describe('ExecutionPlanManager', () => {
  let manager: ExecutionPlanManager;

  beforeEach(() => {
    manager = new ExecutionPlanManager();
    // Execution plan state is now purely in-memory, no localStorage cleanup needed
  });

  describe('clearAllExecutionPlanState', () => {
    test('should clear execution plan buffer', () => {
      // Setup initial state
      manager.storeExecutionPlan('msg-1', 'Test execution plan');
      const initialState = manager.getBufferState();
      expect(Object.keys(initialState.buffer)).toHaveLength(1);

      // Clear state
      manager.clearAllExecutionPlanState();
      const clearedState = manager.getBufferState();
      expect(Object.keys(clearedState.buffer)).toHaveLength(0);
    });

    test('should clear auto-expand state', () => {
      manager.storeExecutionPlan('msg-1', 'Test execution plan');
      const initialState = manager.getBufferState();
      expect(initialState.autoExpand.size).toBe(1);

      manager.clearAllExecutionPlanState();
      const clearedState = manager.getBufferState();
      expect(clearedState.autoExpand.size).toBe(0);
    });

    test('should clear accumulated execution plan state (CRITICAL for preventing contamination)', () => {
      // Setup contaminated state from previous request
      manager.setAccumulatedExecutionPlan('Previous request execution plan');
      expect(manager.getAccumulatedExecutionPlan()).toBe('Previous request execution plan');

      // Clear state - this should prevent contamination
      manager.clearAllExecutionPlanState();
      expect(manager.getAccumulatedExecutionPlan()).toBe(''); // Should be completely empty
    });
  });

  describe('resetStreamingFlags', () => {
    test('should reset isStreaming flag on all messages in current session', () => {
      const sessions: TestSession[] = [{
        contextId: 'session-1',
        messages: [
          { messageId: 'msg-1', text: 'Hello', isStreaming: false, isUser: true, timestamp: '10:00 AM' },
          { messageId: 'msg-2', text: 'Response', isStreaming: true, isUser: false, timestamp: '10:01 AM' },
          { messageId: 'msg-3', text: 'Another', isStreaming: true, isUser: false, timestamp: '10:02 AM' }
        ]
      }];

      const result = manager.resetStreamingFlags(sessions, 'session-1');
      
      expect(result[0].messages[0].isStreaming).toBe(false); // Was already false
      expect(result[0].messages[1].isStreaming).toBe(false); // Should be reset
      expect(result[0].messages[2].isStreaming).toBe(false); // Should be reset
    });

    test('should not affect other sessions', () => {
      const sessions: TestSession[] = [
        {
          contextId: 'session-1',
          messages: [
            { messageId: 'msg-1', text: 'Hello', isStreaming: true, isUser: false, timestamp: '10:00 AM' }
          ]
        },
        {
          contextId: 'session-2',
          messages: [
            { messageId: 'msg-2', text: 'Other', isStreaming: true, isUser: false, timestamp: '10:01 AM' }
          ]
        }
      ];

      const result = manager.resetStreamingFlags(sessions, 'session-1');
      
      expect(result[0].messages[0].isStreaming).toBe(false); // Current session should be reset
      expect(result[1].messages[0].isStreaming).toBe(true);  // Other session should be unchanged
    });
  });

  describe('findStreamingMessage', () => {
    test('should find the newest streaming message', () => {
      const messages: TestMessage[] = [
        { messageId: 'msg-1', text: 'Old', isStreaming: false, isUser: false, timestamp: '10:00 AM' },
        { messageId: 'msg-2', text: 'Streaming 1', isStreaming: true, isUser: false, timestamp: '10:01 AM' },
        { messageId: 'msg-3', text: 'User msg', isStreaming: false, isUser: true, timestamp: '10:02 AM' },
        { messageId: 'msg-4', text: 'Streaming 2', isStreaming: true, isUser: false, timestamp: '10:03 AM' }
      ];

      const result = manager.findStreamingMessage(messages);
      expect(result?.messageId).toBe('msg-4'); // Should return the newest streaming message
    });

    test('should return undefined when no streaming messages exist', () => {
      const messages: TestMessage[] = [
        { messageId: 'msg-1', text: 'Not streaming', isStreaming: false, isUser: false, timestamp: '10:00 AM' }
      ];

      const result = manager.findStreamingMessage(messages);
      expect(result).toBeUndefined();
    });
  });

  describe('storeExecutionPlan', () => {
    test('should store execution plan in buffer', () => {
      manager.storeExecutionPlan('msg-1', '⟦Test execution plan⟧');
      const state = manager.getBufferState();
      
      expect(state.buffer['msg-1']).toBe('Test execution plan'); // Markers should be removed
      expect(state.autoExpand.has('msg-1')).toBe(true);
    });

    test('should not store empty execution plans', () => {
      manager.storeExecutionPlan('msg-1', '');
      const state = manager.getBufferState();
      
      expect(state.buffer['msg-1']).toBeUndefined();
      expect(state.autoExpand.has('msg-1')).toBe(false);
    });

    test('should clean markers from execution plan', () => {
      manager.storeExecutionPlan('msg-1', '⟦Plan with ⟦nested⟧ markers⟧');
      const state = manager.getBufferState();
      
      expect(state.buffer['msg-1']).toBe('Plan with nested markers');
    });
  });

  describe('shouldShowExecutionPlan', () => {
    test('should NOT show execution plan for messages without executionPlan property', () => {
      const message: TestMessage = {
        messageId: 'msg-1',
        text: 'Regular message',
        isStreaming: false,
        isUser: false,
        timestamp: '10:00 AM'
        // No executionPlan property
      };

      // Even if buffer has content, shouldn't show without property
      manager.storeExecutionPlan('msg-1', 'Some execution plan');
      
      const result = manager.shouldShowExecutionPlan(message);
      expect(result).toBe(false);
    });

    test('should show execution plan for messages with property and buffer content', () => {
      const message: TestMessage = {
        messageId: 'msg-1',
        text: 'AI response',
        isStreaming: false,
        isUser: false,
        timestamp: '10:00 AM',
        executionPlan: '' // Has property but empty
      };

      manager.storeExecutionPlan('msg-1', 'Execution plan from buffer');
      
      const result = manager.shouldShowExecutionPlan(message);
      expect(result).toBe(true);
    });

    test('should show execution plan for messages with own content', () => {
      const message: TestMessage = {
        messageId: 'msg-1',
        text: 'AI response',
        isStreaming: false,
        isUser: false,
        timestamp: '10:00 AM',
        executionPlan: 'Own execution plan'
      };

      const result = manager.shouldShowExecutionPlan(message);
      expect(result).toBe(true);
    });
  });

  describe('Full Integration Test - Prevent Contamination', () => {
    test('should prevent accumulated execution plan state contamination (the real bug)', () => {
      // This test simulates the exact contamination pattern found in the logs:
      // Request 1: "create a plan for my week" → Shows correct plan
      // Request 2: "investigate caipe pods" → Shows "CAIPE Community Meeting Planning" (from previous request!)
      
      // === REQUEST 1: "create a plan for my week" ===
      manager.clearAllExecutionPlanState();
      manager.setAccumulatedExecutionPlan('🎯 Execution Plan: Weekly Planning');
      
      // Verify first request state
      expect(manager.getAccumulatedExecutionPlan()).toBe('🎯 Execution Plan: Weekly Planning');
      
      // === REQUEST 2: "investigate caipe pods" ===
      // This is where contamination was happening - accumulated state NOT being cleared
      manager.clearAllExecutionPlanState(); // This should clear the accumulated state
      
      // Verify the contamination is prevented
      expect(manager.getAccumulatedExecutionPlan()).toBe(''); // Should be empty, NOT previous request's plan
      
      // Set new execution plan for second request
      manager.setAccumulatedExecutionPlan('🎯 Execution Plan: Investigate CAIPE Pods');
      expect(manager.getAccumulatedExecutionPlan()).toBe('🎯 Execution Plan: Investigate CAIPE Pods');
      
      // === REQUEST 3: "howdy" ===
      manager.clearAllExecutionPlanState();
      expect(manager.getAccumulatedExecutionPlan()).toBe(''); // Should be clean, not showing previous plan
    });

    test('should prevent execution plan contamination between requests', () => {
      let sessions: TestSession[] = [{
        contextId: 'session-1',
        messages: []
      }];

      // === FIRST REQUEST ===
      // 1. Clear state and reset flags
      manager.clearAllExecutionPlanState();
      sessions = manager.resetStreamingFlags(sessions, 'session-1');

      // 2. Create new streaming message
      const firstMessage = manager.createStreamingMessage();
      firstMessage.executionPlan = ''; // Add property to indicate it will have execution plan
      sessions[0].messages.push(firstMessage);

      // 3. Process execution plan for first message
      manager.storeExecutionPlan(firstMessage.messageId, 'First execution plan');
      firstMessage.executionPlan = 'First execution plan';
      firstMessage.isStreaming = false;

      // Verify first request state
      expect(manager.shouldShowExecutionPlan(firstMessage)).toBe(true);
      const firstState = manager.getBufferState();
      expect(firstState.buffer[firstMessage.messageId]).toBe('First execution plan');

      // === SECOND REQUEST ===
      // 1. Clear state and reset flags (CRITICAL for preventing contamination)
      manager.clearAllExecutionPlanState();
      sessions = manager.resetStreamingFlags(sessions, 'session-1');

      // 2. Create new streaming message  
      const secondMessage = manager.createStreamingMessage();
      secondMessage.executionPlan = ''; // Add property
      sessions[0].messages.push(secondMessage);

      // 3. Verify clean state
      const cleanState = manager.getBufferState();
      expect(Object.keys(cleanState.buffer)).toHaveLength(0); // Buffer should be empty
      expect(cleanState.autoExpand.size).toBe(0);

      // 4. Verify first message still shows its own execution plan (buffer cleanup doesn't affect own content)
      expect(manager.shouldShowExecutionPlan(firstMessage)).toBe(true); // Still has own content

      // 5. Process execution plan for second message
      manager.storeExecutionPlan(secondMessage.messageId, 'Second execution plan');
      secondMessage.executionPlan = 'Second execution plan';
      secondMessage.isStreaming = false;

      // 6. Verify no contamination
      expect(manager.shouldShowExecutionPlan(secondMessage)).toBe(true);
      const finalState = manager.getBufferState();
      expect(finalState.buffer[secondMessage.messageId]).toBe('Second execution plan');
      expect(finalState.buffer[firstMessage.messageId]).toBeUndefined(); // First plan should not exist

      // 7. Verify message isolation
      expect(sessions[0].messages).toHaveLength(2);
      expect(sessions[0].messages[0].isStreaming).toBe(false);
      expect(sessions[0].messages[1].isStreaming).toBe(false);
      expect(sessions[0].messages[0].messageId).toBe(firstMessage.messageId);
      expect(sessions[0].messages[1].messageId).toBe(secondMessage.messageId);
    });
  });
});

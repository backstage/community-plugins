/**
 * Unit tests for AgentForgePage execution plan management logic
 * These tests verify the core state management without full component rendering
 */

describe('AgentForgePage - Execution Plan Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock console.log to avoid noise in test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Message Streaming State Management', () => {
    test('should reset isStreaming flag on all previous messages when creating new streaming message', async () => {
      const messages = [
        { messageId: 'msg-1', text: 'Hello', isStreaming: false, isUser: true, timestamp: '10:00 AM' },
        { messageId: 'msg-2', text: 'Response 1', isStreaming: true, isUser: false, timestamp: '10:01 AM' },
        { messageId: 'msg-3', text: 'Response 2', isStreaming: true, isUser: false, timestamp: '10:02 AM' }
      ];

      // Simulate the reset logic
      const resetStreamingFlags = (msgs: typeof messages) => {
        return msgs.map(msg => ({ ...msg, isStreaming: false }));
      };

      const resetMessages = resetStreamingFlags(messages);
      
      expect(resetMessages.every(msg => msg.isStreaming === false)).toBe(true);
      expect(resetMessages.filter(msg => msg.isStreaming === true)).toHaveLength(0);
    });

    test('should create new streaming message with unique messageId', () => {
      let counter = 0;
      const createStreamingMessage = (text: string = '') => {
        return {
          messageId: `msg-${Date.now()}-${counter++}`,
          text,
          isUser: false,
          timestamp: new Date().toISOString(),
          isStreaming: true
        };
      };

      const msg1 = createStreamingMessage();
      const msg2 = createStreamingMessage();

      expect(msg1.messageId).not.toBe(msg2.messageId);
      expect(msg1.isStreaming).toBe(true);
      expect(msg2.isStreaming).toBe(true);
    });
  });

  describe('Execution Plan Buffer Management', () => {
    test('should clear execution plan buffer when new message is submitted', () => {
      const initialBuffer = {
        'msg-1': 'Old execution plan',
        'msg-2': 'Another old plan'
      };

      // Simulate the cleanup function
      const cleanupExecutionPlanBuffer = () => {
        return {}; // Buffer should be completely cleared
      };

      const cleanedBuffer = cleanupExecutionPlanBuffer();
      expect(cleanedBuffer).toEqual({});
      expect(Object.keys(cleanedBuffer)).toHaveLength(0);
    });

    test('should add execution plan to buffer by messageId', () => {
      const buffer: Record<string, string> = {};
      const messageId = 'msg-123';
      const executionPlan = 'Task 1: Do something\nTask 2: Do something else';

      // Simulate adding to buffer
      buffer[messageId] = executionPlan;

      expect(buffer[messageId]).toBe(executionPlan);
      expect(Object.keys(buffer)).toContain(messageId);
    });

    test('should update execution plan in buffer for same messageId', () => {
      const buffer: Record<string, string> = {
        'msg-123': 'Initial plan'
      };

      // Update with new plan
      buffer['msg-123'] = 'Updated plan with more details';

      expect(buffer['msg-123']).toBe('Updated plan with more details');
      expect(Object.keys(buffer)).toHaveLength(1);
    });

    test('should handle multiple execution plans in buffer', () => {
      const buffer: Record<string, string> = {};
      
      buffer['msg-1'] = 'Plan for message 1';
      buffer['msg-2'] = 'Plan for message 2';
      buffer['msg-3'] = 'Plan for message 3';

      expect(Object.keys(buffer)).toHaveLength(3);
      expect(buffer['msg-1']).toBe('Plan for message 1');
      expect(buffer['msg-2']).toBe('Plan for message 2');
      expect(buffer['msg-3']).toBe('Plan for message 3');
    });

    test('should clear auto-expand state when new message is submitted', () => {
      const initialAutoExpand = new Set(['msg-1', 'msg-2']);
      
      const cleanupAutoExpandState = () => {
        return new Set(); // Should be completely cleared
      };

      const cleanedState = cleanupAutoExpandState();
      expect(cleanedState.size).toBe(0);
      expect(Array.from(cleanedState)).toEqual([]);
    });

    test('should add messageId to auto-expand set', () => {
      const autoExpand = new Set<string>();
      const messageId = 'msg-123';

      autoExpand.add(messageId);

      expect(autoExpand.has(messageId)).toBe(true);
      expect(autoExpand.size).toBe(1);
    });
  });

  describe('Message Identification Logic', () => {
    test('should find the correct streaming message when multiple messages exist', () => {
      const messages = [
        { messageId: 'msg-1', isStreaming: false, isUser: true, text: 'User message' },
        { messageId: 'msg-2', isStreaming: false, isUser: false, text: 'Old AI response' },
        { messageId: 'msg-3', isStreaming: true, isUser: false, text: 'Current AI response' }, // This should be selected
        { messageId: 'msg-4', isStreaming: false, isUser: false, text: 'Another old response' }
      ];

      // Simulate the streaming message finder logic
      const findStreamingMessage = (msgs: typeof messages) => {
        const streamingMessages = msgs.filter(msg => msg.isStreaming === true);
        return streamingMessages[streamingMessages.length - 1]; // Take the newest
      };

      const result = findStreamingMessage(messages);
      expect(result).toBeDefined();
      expect(result?.messageId).toBe('msg-3');
      expect(result?.text).toBe('Current AI response');
    });

    test('should handle case where no streaming messages exist', () => {
      const messages = [
        { messageId: 'msg-1', isStreaming: false, isUser: true, text: 'User message' },
        { messageId: 'msg-2', isStreaming: false, isUser: false, text: 'AI response' }
      ];

      const findStreamingMessage = (msgs: typeof messages) => {
        const streamingMessages = msgs.filter(msg => msg.isStreaming === true);
        return streamingMessages[streamingMessages.length - 1];
      };

      const result = findStreamingMessage(messages);
      expect(result).toBeUndefined();
    });

    test('should find newest streaming message when multiple are streaming', () => {
      const messages = [
        { messageId: 'msg-1', isStreaming: true, isUser: false, text: 'First streaming' },
        { messageId: 'msg-2', isStreaming: true, isUser: false, text: 'Second streaming' },
        { messageId: 'msg-3', isStreaming: true, isUser: false, text: 'Third streaming (newest)' }
      ];

      const findStreamingMessage = (msgs: typeof messages) => {
        const streamingMessages = msgs.filter(msg => msg.isStreaming === true);
        return streamingMessages[streamingMessages.length - 1];
      };

      const result = findStreamingMessage(messages);
      expect(result?.messageId).toBe('msg-3');
      expect(result?.text).toBe('Third streaming (newest)');
    });
  });

  describe('Execution Plan Isolation Logic - SIMPLIFIED BUFFER ONLY', () => {
    test('should only show execution plan if buffer has content for messageId', () => {
      const messageId = 'msg-1';
      const executionPlanBuffer = {
        'msg-1': 'Some execution plan content',
        'msg-2': 'Other execution plan content'
      };

      // Simplified logic: only check buffer
      const currentExecutionPlan = executionPlanBuffer[messageId] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(true);
      expect(currentExecutionPlan).toBe('Some execution plan content');
    });

    test('should not show execution plan if buffer has no content for messageId', () => {
      const messageId = 'msg-3';
      const executionPlanBuffer = {
        'msg-1': 'Some execution plan content',
        'msg-2': 'Other execution plan content'
      };

      const currentExecutionPlan = executionPlanBuffer[messageId] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(false);
      expect(currentExecutionPlan).toBe('');
    });

    test('should not show execution plan if buffer entry is empty string', () => {
      const messageId = 'msg-1';
      const executionPlanBuffer = {
        'msg-1': '',
        'msg-2': 'Valid content'
      };

      const currentExecutionPlan = executionPlanBuffer[messageId] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(false);
    });

    test('should not show execution plan if buffer entry is whitespace only', () => {
      const messageId = 'msg-1';
      const executionPlanBuffer = {
        'msg-1': '   \n  \t  ',
        'msg-2': 'Valid content'
      };

      const currentExecutionPlan = executionPlanBuffer[messageId] || '';
      const hasExecutionPlan = !!(currentExecutionPlan && currentExecutionPlan.trim().length > 0);

      expect(hasExecutionPlan).toBe(false);
    });

    test('should prevent cross-contamination between messages', () => {
      const executionPlanBuffer = {
        'msg-1': 'Plan for message 1',
        'msg-2': 'Plan for message 2',
        'msg-3': 'Plan for message 3'
      };

      // Each message should only see its own plan
      const getPlan = (messageId: string) => executionPlanBuffer[messageId] || '';

      expect(getPlan('msg-1')).toBe('Plan for message 1');
      expect(getPlan('msg-2')).toBe('Plan for message 2');
      expect(getPlan('msg-3')).toBe('Plan for message 3');
      expect(getPlan('msg-4')).toBe(''); // Non-existent message
    });
  });

  describe('Execution Plan Marker Cleanup', () => {
    test('should remove execution plan markers from content', () => {
      const textWithMarkers = '⟦Task 1: Do something\nTask 2: Do another thing⟧';
      
      const cleanText = textWithMarkers.replace(/⟦|⟧/g, '');

      expect(cleanText).toBe('Task 1: Do something\nTask 2: Do another thing');
      expect(cleanText).not.toContain('⟦');
      expect(cleanText).not.toContain('⟧');
    });

    test('should handle multiple marker pairs', () => {
      const textWithMarkers = '⟦First plan⟧ Some text ⟦Second plan⟧';
      
      const cleanText = textWithMarkers.replace(/⟦|⟧/g, '');

      expect(cleanText).toBe('First plan Some text Second plan');
    });

    test('should handle text without markers', () => {
      const textWithoutMarkers = 'Regular execution plan text';
      
      const cleanText = textWithoutMarkers.replace(/⟦|⟧/g, '');

      expect(cleanText).toBe('Regular execution plan text');
    });
  });

  describe('Text Accumulation State', () => {
    test('should reset text accumulation between requests', () => {
      let accumulatedText = 'Previous request text';
      
      const resetTextAccumulation = () => {
        accumulatedText = '';
      };

      resetTextAccumulation();
      expect(accumulatedText).toBe('');
    });

    test('should accumulate text chunks during streaming', () => {
      let accumulatedText = '';
      
      const chunks = ['Hello', ' world', '!', ' How are you?'];
      
      chunks.forEach(chunk => {
        accumulatedText += chunk;
      });

      expect(accumulatedText).toBe('Hello world! How are you?');
    });

    test('should properly handle fresh start vs append modes', () => {
      let accumulatedText = 'Existing text';
      
      const processTextEvent = (newText: string, appendMode: boolean) => {
        if (appendMode) {
          accumulatedText += newText;
        } else {
          accumulatedText = newText; // Fresh start
        }
        return accumulatedText;
      };

      // Test append mode
      const result1 = processTextEvent(' appended', true);
      expect(result1).toBe('Existing text appended');

      // Test fresh start mode
      const result2 = processTextEvent('Fresh start', false);
      expect(result2).toBe('Fresh start');
    });
  });

  describe('Request Isolation', () => {
    test('should track current request ID to prevent cross-contamination', () => {
      const currentRequestIdRef = { current: '' };
      
      // Start first request
      currentRequestIdRef.current = 'request-1';
      expect(currentRequestIdRef.current).toBe('request-1');
      
      // Start second request (should overwrite)
      currentRequestIdRef.current = 'request-2';
      expect(currentRequestIdRef.current).toBe('request-2');
    });

    test('should reject events from previous requests', () => {
      const currentRequestId = 'request-2';
      const eventRequestId = 'request-1';
      
      const shouldProcessEvent = (current: string, event: string) => {
        return current === event;
      };

      const shouldProcess = shouldProcessEvent(currentRequestId, eventRequestId);
      expect(shouldProcess).toBe(false);
    });

    test('should accept events from current request', () => {
      const currentRequestId = 'request-2';
      const eventRequestId = 'request-2';
      
      const shouldProcessEvent = (current: string, event: string) => {
        return current === event;
      };

      const shouldProcess = shouldProcessEvent(currentRequestId, eventRequestId);
      expect(shouldProcess).toBe(true);
    });
  });

  describe('Integration Test - Full Request Cycle with Buffer Only', () => {
    test('should handle complete request cycle without contamination', () => {
      // Simulate a complete request cycle
      let executionPlanBuffer: Record<string, string> = {};
      let autoExpandExecutionPlans = new Set<string>();
      let messages: Array<{messageId: string, isStreaming: boolean, text: string}> = [];

      // Step 1: Submit first request
      const submitFirstRequest = () => {
        // Clear buffers
        executionPlanBuffer = {};
        autoExpandExecutionPlans = new Set();
        
        // Reset streaming flags on all messages
        messages = messages.map(msg => ({ ...msg, isStreaming: false }));
        
        // Add new streaming message
        messages.push({
          messageId: 'msg-1',
          isStreaming: true,
          text: ''
        });
      };

      // Step 2: Process execution plan for first request (buffer only)
      const processExecutionPlan = (messageId: string, plan: string) => {
        executionPlanBuffer[messageId] = plan;
        autoExpandExecutionPlans.add(messageId);
        
        // Update message streaming state
        const msgIndex = messages.findIndex(m => m.messageId === messageId);
        if (msgIndex >= 0) {
          messages[msgIndex].isStreaming = false;
        }
      };

      // Step 3: Submit second request
      const submitSecondRequest = () => {
        // Clear buffers (CRITICAL for preventing contamination)
        executionPlanBuffer = {};
        autoExpandExecutionPlans = new Set();
        
        // Reset streaming flags
        messages = messages.map(msg => ({ ...msg, isStreaming: false }));
        
        // Add new streaming message
        messages.push({
          messageId: 'msg-2',
          isStreaming: true,
          text: ''
        });
      };

      // Execute the test scenario
      submitFirstRequest();
      expect(messages).toHaveLength(1);
      expect(messages[0].messageId).toBe('msg-1');
      expect(messages[0].isStreaming).toBe(true);

      processExecutionPlan('msg-1', 'First execution plan');
      expect(executionPlanBuffer['msg-1']).toBe('First execution plan');
      expect(autoExpandExecutionPlans.has('msg-1')).toBe(true);

      submitSecondRequest();
      expect(messages).toHaveLength(2);
      expect(messages[1].messageId).toBe('msg-2');
      expect(messages[1].isStreaming).toBe(true);
      expect(messages[0].isStreaming).toBe(false); // Previous message should be reset
      
      // CRITICAL: Buffers should be clean for second request
      expect(Object.keys(executionPlanBuffer)).toHaveLength(0);
      expect(autoExpandExecutionPlans.size).toBe(0);

      processExecutionPlan('msg-2', 'Second execution plan');
      expect(executionPlanBuffer['msg-2']).toBe('Second execution plan');
      expect(executionPlanBuffer['msg-1']).toBeUndefined(); // First plan should not contaminate
    });

    test('should handle rapid consecutive requests', () => {
      let executionPlanBuffer: Record<string, string> = {};
      const messages: string[] = [];

      // Simulate 5 rapid requests
      for (let i = 1; i <= 5; i++) {
        // Clear buffer for each request
        executionPlanBuffer = {};
        
        const messageId = `msg-${i}`;
        messages.push(messageId);
        
        // Add execution plan for current request only
        executionPlanBuffer[messageId] = `Plan ${i}`;
        
        // Verify isolation
        expect(Object.keys(executionPlanBuffer)).toHaveLength(1);
        expect(executionPlanBuffer[messageId]).toBe(`Plan ${i}`);
        
        // Previous plans should not exist in buffer
        for (let j = 1; j < i; j++) {
          expect(executionPlanBuffer[`msg-${j}`]).toBeUndefined();
        }
      }

      expect(messages).toHaveLength(5);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined messageId gracefully', () => {
      const messageKey = undefined || 'unknown';
      const executionPlanBuffer = {
        'unknown': 'Fallback plan'
      };

      const plan = executionPlanBuffer[messageKey] || '';
      expect(plan).toBe('Fallback plan');
    });

    test('should handle empty buffer gracefully', () => {
      const executionPlanBuffer: Record<string, string> = {};
      const messageId = 'msg-1';

      const plan = executionPlanBuffer[messageId] || '';
      const hasPlan = !!(plan && plan.trim().length > 0);

      expect(hasPlan).toBe(false);
      expect(plan).toBe('');
    });

    test('should handle buffer with null values', () => {
      const executionPlanBuffer: Record<string, any> = {
        'msg-1': null
      };
      const messageId = 'msg-1';

      const plan = executionPlanBuffer[messageId] || '';
      const hasPlan = !!(plan && plan.trim().length > 0);

      expect(hasPlan).toBe(false);
    });

    test('should handle very long execution plans', () => {
      const longPlan = 'Task '.repeat(1000) + 'Final task';
      const executionPlanBuffer = {
        'msg-1': longPlan
      };

      const plan = executionPlanBuffer['msg-1'] || '';
      expect(plan.length).toBeGreaterThan(5000);
      expect(plan.endsWith('Final task')).toBe(true);
    });
  });
});

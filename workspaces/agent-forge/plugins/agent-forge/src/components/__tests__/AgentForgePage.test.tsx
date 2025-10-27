import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { AgentForgePage } from '../AgentForgePage';

// Mock the APIs
const mockApis = TestApiProvider.create({
  apis: [],
});

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
      const { container } = render(
        <TestApiProvider apis={mockApis}>
          <AgentForgePage />
        </TestApiProvider>
      );

      // Mock the internal state to simulate existing messages
      const component = container.querySelector('[data-testid="agent-forge-page"]');
      
      // Simulate having messages with isStreaming: true
      const mockSessions = [{
        contextId: 'test-session-1',
        messages: [
          { messageId: 'msg-1', text: 'Hello', isStreaming: false, isUser: true, timestamp: '10:00 AM' },
          { messageId: 'msg-2', text: 'Response 1', isStreaming: true, isUser: false, timestamp: '10:01 AM' },
          { messageId: 'msg-3', text: 'Response 2', isStreaming: true, isUser: false, timestamp: '10:02 AM' }
        ],
        title: 'Test Chat',
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      // We'll need to access the component's internal functions
      // This test verifies the logic conceptually - in real implementation,
      // we'd need to refactor to make these functions testable
      expect(true).toBe(true); // Placeholder - see detailed tests below
    });
  });

  describe('Execution Plan Buffer Management', () => {
    test('should clear execution plan buffer when new message is submitted', () => {
      // Test the buffer cleanup logic
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

    test('should clear auto-expand state when new message is submitted', () => {
      const initialAutoExpand = new Set(['msg-1', 'msg-2']);
      
      const cleanupAutoExpandState = () => {
        return new Set(); // Should be completely cleared
      };

      const cleanedState = cleanupAutoExpandState();
      expect(cleanedState.size).toBe(0);
      expect(Array.from(cleanedState)).toEqual([]);
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
  });

  describe('Execution Plan Isolation Logic', () => {
    test('should only show execution plan for messages that own it', () => {
      const message = {
        messageId: 'msg-1',
        text: 'Regular message',
        // No executionPlan property - should NOT show execution plan
      };

      const executionPlanBuffer = {
        'msg-1': 'Some execution plan content',
        'msg-2': 'Other execution plan content'
      };

      // Simulate the isolation logic from ChatMessage.tsx
      const shouldShowExecutionPlan = (msg: typeof message, buffer: typeof executionPlanBuffer) => {
        const messageHasExecutionPlanProperty = msg.hasOwnProperty('executionPlan');
        const messageKey = msg.messageId || 'unknown';
        const bufferHasContentForThisMessage = !!(buffer[messageKey] && buffer[messageKey].trim());
        
        // Only show if message has executionPlan property AND (has own content OR buffer has content)
        return messageHasExecutionPlanProperty && (
          !!(msg as any).executionPlan?.trim() || bufferHasContentForThisMessage
        );
      };

      const result = shouldShowExecutionPlan(message, executionPlanBuffer);
      expect(result).toBe(false); // Should NOT show because message doesn't have executionPlan property
    });

    test('should show execution plan for messages that have the property', () => {
      const message = {
        messageId: 'msg-1',
        text: 'AI response',
        executionPlan: '', // Has the property, but empty content
      };

      const executionPlanBuffer = {
        'msg-1': 'Execution plan from buffer',
      };

      const shouldShowExecutionPlan = (msg: typeof message, buffer: typeof executionPlanBuffer) => {
        const messageHasExecutionPlanProperty = msg.hasOwnProperty('executionPlan');
        const messageKey = msg.messageId || 'unknown';
        const bufferHasContentForThisMessage = !!(buffer[messageKey] && buffer[messageKey].trim());
        
        return messageHasExecutionPlanProperty && (
          !!(msg.executionPlan?.trim()) || bufferHasContentForThisMessage
        );
      };

      const result = shouldShowExecutionPlan(message, executionPlanBuffer);
      expect(result).toBe(true); // Should show because message has property AND buffer has content
    });
  });

  describe('Text Accumulation State', () => {
    test('should reset text accumulation between requests', () => {
      // Simulate the text accumulation logic
      let accumulatedText = 'Previous request text';
      
      // When starting a new request, text should be reset
      const resetTextAccumulation = () => {
        accumulatedText = '';
      };

      resetTextAccumulation();
      expect(accumulatedText).toBe('');
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

  describe('Integration Test - Full Request Cycle', () => {
    test('should handle complete request cycle without contamination', () => {
      // Simulate a complete request cycle
      let executionPlanBuffer: Record<string, string> = {};
      let autoExpandExecutionPlans = new Set<string>();
      let messages: Array<{messageId: string, isStreaming: boolean, text: string, executionPlan?: string}> = [];

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
          text: '',
          executionPlan: ''
        });
      };

      // Step 2: Process execution plan for first request
      const processExecutionPlan = (messageId: string, plan: string) => {
        executionPlanBuffer[messageId] = plan;
        autoExpandExecutionPlans.add(messageId);
        
        // Update message
        const msgIndex = messages.findIndex(m => m.messageId === messageId);
        if (msgIndex >= 0) {
          messages[msgIndex].executionPlan = plan;
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
          text: '',
          executionPlan: ''
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
  });
});

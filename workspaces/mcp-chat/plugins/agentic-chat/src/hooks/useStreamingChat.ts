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

import { useState, useRef, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { useAbortController } from './useAbortController';
import { useStreamingStateBatching } from './useStreamingStateBatching';
import {
  ChatMessage as ApiChatMessage,
  StreamingEvent,
  Message,
} from '../types';
import {
  StreamingState,
  createInitialStreamingState,
  updateStreamingState,
} from '../components/StreamingMessage';
import { debugError, handleStreamError, buildBotResponse } from '../utils';

// Re-export for backward compatibility
export { stripEchoedToolOutput } from '../utils';
export type { Message };

/**
 * Options for the streaming chat hook
 */
export interface UseStreamingChatOptions {
  /** Enable RAG (retrieval-augmented generation) */
  enableRAG: boolean;
  /** Callback when messages change */
  onMessagesChange: (messages: Message[]) => void;
  /** Callback to scroll to bottom */
  onScrollToBottom?: () => void;
  /** Callback when a new session is lazily created (first message) */
  onSessionCreated?: (sessionId: string) => void;
}

/**
 * Return type for the streaming chat hook
 */
export interface UseStreamingChatReturn {
  /** Current streaming state */
  streamingState: StreamingState | null;
  /** Whether the AI is currently generating */
  isTyping: boolean;
  /** Send a message to the API */
  sendMessage: (text: string, messages: Message[]) => Promise<void>;
  /** Cancel the current request */
  cancelRequest: () => void;
  /** Reset conversation state (clears previousResponseId and conversationId) */
  resetConversation: () => void;
  /** Update streaming state directly (for HITL) */
  setStreamingState: React.Dispatch<
    React.SetStateAction<StreamingState | null>
  >;
  /** Set typing state directly */
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  /** Set previousResponseId (e.g. when loading a conversation from history) */
  setPreviousResponseId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  /** Set conversationId (e.g. when loading a conversation from history) */
  setConversationId: React.Dispatch<React.SetStateAction<string | undefined>>;
  /** Set sessionId — when set, backend manages conversation_id lookup */
  setSessionId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

/**
 * Hook to manage streaming chat with the AI agent
 * Handles message sending, streaming state, and response processing
 */
export function useStreamingChat({
  enableRAG,
  onMessagesChange,
  onScrollToBottom,
  onSessionCreated,
}: UseStreamingChatOptions): UseStreamingChatReturn {
  const api = useApi(agenticChatApiRef);
  const {
    mountedRef,
    cancelRequest: abortInFlight,
    createController,
    abortControllerRef,
  } = useAbortController();
  const {
    state: streamingState,
    setState: setStreamingState,
    scheduleStreamingUpdate,
    flushStreamingState,
    pendingStateRef,
  } = useStreamingStateBatching<StreamingState | null>(null, {
    onFlush: onScrollToBottom,
  });
  const [isTyping, setIsTyping] = useState(false);
  const messageIdCounter = useRef(0);
  const nextMessageId = useCallback(() => {
    const id = messageIdCounter.current;
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${id}`;
  }, []);

  // Store previousResponseId in state for reliable conversation threading
  const [previousResponseId, setPreviousResponseId] = useState<
    string | undefined
  >(undefined);
  const previousResponseIdRef = useRef(previousResponseId);
  previousResponseIdRef.current = previousResponseId;

  // Store conversationId for linking responses to a Llama Stack conversation
  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined,
  );
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // Session-based flow: when set, backend manages conversation_id lookup
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const cancelRequest = useCallback(() => {
    const hadActiveStream = abortControllerRef.current !== null;
    abortInFlight();
    setIsTyping(false);

    const partial = pendingStateRef.current as StreamingState | null;
    if (hadActiveStream && partial && partial.text.trim()) {
      setStreamingState({
        ...partial,
        phase: 'completed' as const,
        completed: true,
        text: `${partial.text}\n\n*(stopped)*`,
      });
    } else {
      setStreamingState(null);
    }
    pendingStateRef.current = null;
  }, [abortInFlight, abortControllerRef, pendingStateRef, setStreamingState]);

  // Reset conversation state (call when clearing chat history)
  const resetConversation = useCallback(() => {
    setPreviousResponseId(undefined);
    setConversationId(undefined);
    setSessionId(undefined);
  }, []);

  const sendMessage = useCallback(
    async (messageText: string, messages: Message[]) => {
      const controller = createController();

      const newMessage: Message = {
        id: nextMessageId(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };
      onMessagesChange([...messages, newMessage]);
      setIsTyping(true);

      // Initialize streaming state
      let currentStreamingState = createInitialStreamingState();
      setStreamingState(currentStreamingState);

      try {
        // Auto-create a session if none exists (first message on page load)
        let activeSessionId = sessionIdRef.current;
        if (!activeSessionId) {
          try {
            const title = messageText.slice(0, 80);
            const session = await api.createSession(title);
            activeSessionId = session.id;
            setSessionId(activeSessionId);
            onSessionCreated?.(activeSessionId);
          } catch {
            debugError('Failed to create session, falling back to legacy flow');
          }
        }

        // Session-based flow: backend manages conversation_id lookup/creation
        if (activeSessionId) {
          const apiMessages: ApiChatMessage[] = [
            { role: 'user' as const, content: messageText },
          ];

          await api.chatStreamWithSession(
            apiMessages,
            (event: StreamingEvent) => {
              const eventResponseId =
                event.type === 'stream.started' ||
                event.type === 'stream.completed'
                  ? (event.responseId as string | undefined)
                  : undefined;
              if (eventResponseId) {
                setPreviousResponseId(eventResponseId);
              }
              currentStreamingState = updateStreamingState(
                currentStreamingState,
                event,
              );
              scheduleStreamingUpdate(currentStreamingState);
            },
            activeSessionId,
            enableRAG,
            controller.signal,
          );
        } else {
          // Legacy flow: frontend manages conversation_id
          let activeConvId = conversationIdRef.current;
          if (!activeConvId) {
            try {
              const result = await api.createConversation();
              activeConvId = result.conversationId;
              setConversationId(activeConvId);
            } catch {
              debugError(
                'Failed to create conversation, continuing without conversationId',
              );
            }
          }

          const hasNativeContext = !!(
            activeConvId || previousResponseIdRef.current
          );

          let apiMessages: ApiChatMessage[];
          if (hasNativeContext) {
            apiMessages = [{ role: 'user' as const, content: messageText }];
          } else {
            const MAX_CONTEXT_MESSAGES = 20;
            const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
            apiMessages = [
              ...recentMessages.map(msg => ({
                role: msg.isUser ? ('user' as const) : ('assistant' as const),
                content: msg.text,
              })),
              { role: 'user' as const, content: messageText },
            ];
          }

          await api.chatStream(
            apiMessages,
            (event: StreamingEvent) => {
              const eventResponseId =
                event.type === 'stream.started' ||
                event.type === 'stream.completed'
                  ? (event.responseId as string | undefined)
                  : undefined;
              if (eventResponseId) {
                setPreviousResponseId(eventResponseId);
              }
              currentStreamingState = updateStreamingState(
                currentStreamingState,
                event,
              );
              scheduleStreamingUpdate(currentStreamingState);
            },
            enableRAG,
            controller.signal,
            previousResponseIdRef.current,
            activeConvId,
          );
        }

        if (controller.signal.aborted || !mountedRef.current) {
          return;
        }

        // Flush any pending batched updates before finalization
        flushStreamingState();

        if (!mountedRef.current) return;

        setIsTyping(false);
        abortControllerRef.current = null;

        // Don't clear streaming state if there's a pending approval (HITL)
        if (currentStreamingState.phase !== 'pending_approval') {
          setStreamingState(null);
          pendingStateRef.current = null;
        }

        // Skip processing if HITL is pending
        if (currentStreamingState.phase === 'pending_approval') {
          return;
        }

        const botResponse = buildBotResponse(
          currentStreamingState,
          nextMessageId(),
        );
        onMessagesChange([...messages, newMessage, botResponse]);
      } catch (err) {
        // Intentional abort (user cancelled or sent a new message).
        // If partial content was captured, finalize it as a stopped message.
        if (err instanceof DOMException && err.name === 'AbortError') {
          const partial = pendingStateRef.current;
          if (partial && partial.text.trim() && mountedRef.current) {
            flushStreamingState();
            setIsTyping(false);
            setStreamingState(null);
            pendingStateRef.current = null;

            const stoppedResponse: Message = {
              id: nextMessageId(),
              text: `${partial.text}\n\n*(stopped)*`,
              isUser: false,
              timestamp: new Date(),
              toolCalls:
                partial.toolCalls.length > 0
                  ? partial.toolCalls.map(tc => ({
                      id: tc.id,
                      name: tc.name || tc.type || 'tool',
                      serverLabel: tc.serverLabel || 'mcp-server',
                      arguments: tc.arguments || '{}',
                      output: tc.output,
                      error: tc.error,
                    }))
                  : undefined,
              ragSources: partial.ragSources,
              responseId: partial.responseId,
              usage: partial.usage,
            };
            onMessagesChange([...messages, newMessage, stoppedResponse]);
          }
          return;
        }

        const errorMsg = handleStreamError(err, abortControllerRef, mountedRef);
        if (errorMsg === undefined) return;

        setIsTyping(false);
        setStreamingState(null);

        const isNetworkError =
          err instanceof TypeError ||
          (err instanceof Error && /network|fetch|timeout/i.test(err.message));
        const errorResponse: Message = {
          id: nextMessageId(),
          text: errorMsg,
          isUser: false,
          timestamp: new Date(),
          errorCode: isNetworkError ? 'network' : 'stream_error',
        };
        onMessagesChange([...messages, newMessage, errorResponse]);
        debugError('Chat error:', err);
      }
    },
    [
      api,
      enableRAG,
      onMessagesChange,
      onSessionCreated,
      nextMessageId,
      scheduleStreamingUpdate,
      flushStreamingState,
      createController,
      abortControllerRef,
      mountedRef,
      pendingStateRef,
      setStreamingState,
    ],
  );

  return {
    streamingState,
    isTyping,
    sendMessage,
    cancelRequest,
    resetConversation,
    setStreamingState,
    setIsTyping,
    setPreviousResponseId,
    setConversationId,
    setSessionId,
  };
}

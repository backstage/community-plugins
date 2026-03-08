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
import { useState, useRef, useCallback, useEffect } from 'react';
import { Message } from '../types';
import { debugLog, debugError } from '../utils';
import type { ChatContainerRef } from '../components/ChatContainer';

export interface UseChatSessionsApi {
  getSessionMessages(sessionId: string): Promise<{
    messages: Array<{
      role: 'user' | 'assistant';
      text: string;
      createdAt?: string;
      toolCalls?: Array<{
        id: string;
        name: string;
        serverLabel: string;
        arguments?: string;
        output?: string;
        error?: string;
      }>;
      ragSources?: Array<{
        filename: string;
        text?: string;
        score?: number;
        fileId?: string;
        attributes?: Record<string, unknown>;
      }>;
    }>;
    sessionCreatedAt?: string;
  }>;
  getAdminSessionMessages(sessionId: string): Promise<{
    messages: Array<{
      role: 'user' | 'assistant';
      text: string;
      createdAt?: string;
      toolCalls?: Array<{
        id: string;
        name: string;
        serverLabel: string;
        arguments?: string;
        output?: string;
        error?: string;
      }>;
      ragSources?: Array<{
        filename: string;
        text?: string;
        score?: number;
        fileId?: string;
        attributes?: Record<string, unknown>;
      }>;
    }>;
    sessionCreatedAt?: string;
  }>;
}

export interface UseChatSessionsOptions {
  api: UseChatSessionsApi;
  chatContainerRef: React.RefObject<ChatContainerRef | null>;
  isStreaming?: boolean;
}

export interface UseChatSessionsReturn {
  // State
  activeSessionId: string | undefined;
  messages: Message[];
  loadingConversation: boolean;
  sessionRefreshTrigger: number;
  switchDialogOpen: boolean;
  error: string | null;
  setError: (error: string | null) => void;

  // Handlers
  handleNewChat: () => void;
  handleMessagesChange: (newMessages: Message[]) => void;
  handleSessionCreated: (newSessionId: string) => void;
  handleSelectSession: (
    sessionId: string,
    adminView?: boolean,
  ) => Promise<void>;
  guardedSelectSession: (sessionId: string, adminView?: boolean) => void;
  handleSwitchConfirm: () => void;
  handleSwitchCancel: () => void;
}

export function useChatSessions({
  api,
  chatContainerRef,
  isStreaming,
}: UseChatSessionsOptions): UseChatSessionsReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sessionRefreshTrigger, setSessionRefreshTrigger] = useState(0);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAbortRef = useRef<AbortController | null>(null);
  const pendingSwitchRef = useRef<{
    sessionId: string;
    adminView?: boolean;
  } | null>(null);

  // Cancel any in-flight conversation load on unmount
  useEffect(() => {
    return () => {
      loadAbortRef.current?.abort();
    };
  }, []);

  const handleNewChat = useCallback(() => {
    loadAbortRef.current?.abort();
    if (chatContainerRef.current) {
      chatContainerRef.current.cancelOngoingRequest();
      chatContainerRef.current.resetConversation();
    }
    setError(null);
    setMessages([]);
    setActiveSessionId(undefined);
    setLoadingConversation(false);
  }, [chatContainerRef]);

  const handleMessagesChange = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
    setSessionRefreshTrigger(prev => prev + 1);
  }, []);

  const handleSessionCreated = useCallback((newSessionId: string) => {
    setActiveSessionId(newSessionId);
  }, []);

  const handleSelectSession = useCallback(
    async (sessionId: string, adminView?: boolean) => {
      if (loadAbortRef.current) {
        loadAbortRef.current.abort();
      }
      chatContainerRef.current?.cancelOngoingRequest();

      const abortController = new AbortController();
      loadAbortRef.current = abortController;

      setLoadingConversation(true);

      try {
        debugLog('Loading session:', sessionId, adminView ? '(admin)' : '');

        const result = adminView
          ? await api.getAdminSessionMessages(sessionId)
          : await api.getSessionMessages(sessionId);
        if (abortController.signal.aborted) return;

        const { messages: processed, sessionCreatedAt } = result;
        const fallbackBase = sessionCreatedAt
          ? new Date(sessionCreatedAt)
          : new Date();
        const restoredMessages: Message[] = processed.map((pm, i) => {
          let timestamp: Date;
          if (pm.createdAt) {
            timestamp = new Date(pm.createdAt);
          } else {
            timestamp = new Date(fallbackBase.getTime() + i * 1000);
          }
          const msg: Message = {
            id: `restored-${i}`,
            text: pm.text,
            isUser: pm.role === 'user',
            timestamp,
          };
          if (pm.toolCalls && pm.toolCalls.length > 0) {
            msg.toolCalls = pm.toolCalls.map(tc => ({
              id: tc.id,
              name: tc.name,
              serverLabel: tc.serverLabel,
              arguments: tc.arguments || '{}',
              output: tc.output,
              error: tc.error,
            }));
          }
          if (pm.ragSources && pm.ragSources.length > 0) {
            msg.ragSources = pm.ragSources.map(rs => ({
              filename: rs.filename,
              text: rs.text ?? '',
              score: rs.score,
              fileId: rs.fileId,
              attributes: rs.attributes,
            }));
          }
          return msg;
        });

        debugLog(
          `Restored ${restoredMessages.length} messages (${
            restoredMessages.filter(m => m.isUser).length
          } user, ${restoredMessages.filter(m => !m.isUser).length} assistant)`,
        );

        setMessages(restoredMessages);
        setActiveSessionId(sessionId);
        setError(null);
        chatContainerRef.current?.setPreviousResponseId(undefined);
        chatContainerRef.current?.setConversationId(undefined);
        chatContainerRef.current?.setSessionId(sessionId);
      } catch (err) {
        if (abortController.signal.aborted) return;
        debugError('Failed to load session:', err);
        setError(
          err instanceof Error
            ? `Failed to load session: ${err.message}`
            : 'Failed to load session',
        );
        setMessages([]);
        setActiveSessionId(undefined);
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingConversation(false);
        }
      }
    },
    [api, chatContainerRef],
  );

  const guardedSelectSession = useCallback(
    (sessionId: string, adminView?: boolean) => {
      const streaming =
        typeof isStreaming === 'boolean'
          ? isStreaming
          : chatContainerRef.current?.isStreaming() ?? false;
      if (streaming) {
        pendingSwitchRef.current = { sessionId, adminView };
        setSwitchDialogOpen(true);
        return;
      }
      handleSelectSession(sessionId, adminView);
    },
    [handleSelectSession, isStreaming, chatContainerRef],
  );

  const handleSwitchConfirm = useCallback(() => {
    setSwitchDialogOpen(false);
    chatContainerRef.current?.cancelOngoingRequest();
    if (pendingSwitchRef.current) {
      const { sessionId, adminView } = pendingSwitchRef.current;
      pendingSwitchRef.current = null;
      handleSelectSession(sessionId, adminView);
    }
  }, [handleSelectSession, chatContainerRef]);

  const handleSwitchCancel = useCallback(() => {
    setSwitchDialogOpen(false);
    pendingSwitchRef.current = null;
  }, []);

  return {
    activeSessionId,
    messages,
    loadingConversation,
    sessionRefreshTrigger,
    switchDialogOpen,
    error,
    setError,
    handleNewChat,
    handleMessagesChange,
    handleSessionCreated,
    handleSelectSession,
    guardedSelectSession,
    handleSwitchConfirm,
    handleSwitchCancel,
  };
}

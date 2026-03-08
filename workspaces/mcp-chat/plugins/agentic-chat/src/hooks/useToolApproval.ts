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

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { PendingApproval } from '../components/ToolApprovalDialog';
import { StreamingState } from '../components/StreamingMessage';
import { debugError, stripToolPrefix } from '../utils';
import { getSeverity } from '../utils/toolSeverity';
import type { Message } from './useStreamingChat';

export type { ToolSeverity } from '../utils/toolSeverity';

/**
 * Options for the tool approval hook
 */
export interface UseToolApprovalOptions {
  /** Current streaming state */
  streamingState: StreamingState | null;
  /** Current messages */
  messages: Message[];
  /** Callback when messages change */
  onMessagesChange: (messages: Message[]) => void;
  /** Callback to clear streaming state */
  onClearStreamingState: () => void;
  /** Callback to set typing state */
  onSetTyping: (typing: boolean) => void;
}

/**
 * Return type for the tool approval hook
 */
export interface UseToolApprovalReturn {
  /** Current pending approval */
  pendingApproval: PendingApproval | null;
  /** Whether approval submission is in progress */
  isApprovalSubmitting: boolean;
  /** Error from the last approve/reject attempt, if any */
  approvalError: string | null;
  /** Handle tool approval */
  handleApprove: (
    approvalId: string,
    modifiedArguments?: string,
  ) => Promise<void>;
  /** Handle tool rejection */
  handleReject: (approvalId: string, reason?: string) => Promise<void>;
}

/**
 * Hook to manage Human-in-the-Loop (HITL) tool approval
 * Watches for pending approvals in streaming state and handles approve/reject actions
 */
export function useToolApproval({
  streamingState,
  messages,
  onMessagesChange,
  onClearStreamingState,
  onSetTyping,
}: UseToolApprovalOptions): UseToolApprovalReturn {
  const api = useApi(agenticChatApiRef);
  const [pendingApproval, setPendingApproval] =
    useState<PendingApproval | null>(null);
  const [isApprovalSubmitting, setIsApprovalSubmitting] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const submittingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  // Keep a ref to latest messages so approval handlers use current data
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Capture streaming state when approval is detected so we can merge it later
  const preApprovalStateRef = useRef<StreamingState | null>(null);

  // Clear approval state when streaming is cancelled or session changes
  useEffect(() => {
    if (!streamingState || streamingState.phase !== 'pending_approval') {
      if (pendingApproval && !submittingRef.current) {
        setPendingApproval(null);
        setApprovalError(null);
      }
    }
  }, [streamingState, pendingApproval]);

  // Watch for pending approvals in streaming state and transform for dialog
  useEffect(() => {
    if (
      streamingState?.phase === 'pending_approval' &&
      streamingState.pendingApproval &&
      !pendingApproval
    ) {
      const pa = streamingState.pendingApproval;

      // Capture pre-approval state for merging into the final message
      preApprovalStateRef.current = streamingState;

      // Parse arguments for display
      let parsedArguments: Record<string, unknown> = {};
      try {
        parsedArguments = JSON.parse(pa.arguments);
      } catch {
        parsedArguments = { raw: pa.arguments };
      }

      setPendingApproval({
        approvalId: pa.toolCallId,
        responseId: pa.responseId,
        toolCall: {
          callId: pa.toolCallId,
          name: pa.toolName,
          serverLabel: pa.serverLabel || 'Unknown Server',
          arguments: pa.arguments,
          parsedArguments,
        },
        requestedAt: pa.requestedAt,
        confirmationMessage: pa.confirmationMessage,
        severity: getSeverity(pa.toolName),
      });
    }
  }, [streamingState, pendingApproval]);

  const handleApprove = useCallback(
    async (approvalId: string, modifiedArguments?: string) => {
      if (!pendingApproval || submittingRef.current) return;

      submittingRef.current = true;
      setIsApprovalSubmitting(true);
      setApprovalError(null);

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const toolArgs =
          modifiedArguments || pendingApproval.toolCall.arguments;
        const result = await api.submitToolApproval(
          pendingApproval.responseId,
          approvalId,
          true, // approved
          pendingApproval.toolCall.name,
          toolArgs,
          controller.signal,
        );

        if (!mountedRef.current) return;

        if (result.success) {
          const executedToolName = pendingApproval.toolCall.name;
          const displayToolName = stripToolPrefix(
            executedToolName,
            pendingApproval.toolCall.serverLabel,
          );
          const preState = preApprovalStateRef.current;

          const responseText =
            result.content ||
            `⚡ **Executed:** \`${displayToolName}\`\n\nThe operation completed successfully.`;

          const combinedText = preState?.text?.trim()
            ? `${preState.text.trim()}\n\n${responseText}`
            : responseText;

          const preApprovalToolCalls = (preState?.toolCalls || [])
            .filter(tc => tc.id !== approvalId && tc.status === 'completed')
            .map(tc => ({
              id: tc.id,
              name: tc.name || 'tool',
              serverLabel: tc.serverLabel || 'mcp-server',
              arguments: tc.arguments || '{}',
              output: tc.output,
              error: tc.error,
            }));

          const approvedToolCall: {
            id: string;
            name: string;
            serverLabel: string;
            arguments: string;
            output?: string;
            error?: string;
          } = {
            id: approvalId,
            name: executedToolName,
            serverLabel: pendingApproval.toolCall.serverLabel || 'mcp-server',
            arguments: pendingApproval.toolCall.arguments,
            output: result.toolOutput,
          };

          // When toolExecuted is false, the model may have intentionally
          // skipped the tool and returned a text response (e.g. a follow-up
          // question).  Only flag as an error when there is no meaningful
          // LLM content either — that indicates a genuine backend failure.
          const modelReturnedText =
            result.content !== null &&
            result.content !== undefined &&
            result.content.trim().length > 0;
          const toolSkippedByModel =
            result.toolExecuted === false &&
            !result.toolOutput &&
            modelReturnedText;

          if (
            result.toolExecuted === false &&
            !result.toolOutput &&
            !modelReturnedText
          ) {
            approvedToolCall.error =
              'Tool execution failed — check backend logs for details';
          }

          // If the model intentionally skipped the tool (returned a text
          // answer instead), don't include the tool call in the message —
          // the text response already covers the user's question.
          const toolCalls = toolSkippedByModel
            ? preApprovalToolCalls
            : [...preApprovalToolCalls, approvedToolCall];

          const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            text: combinedText,
            isUser: false,
            timestamp: new Date(),
            responseId: result.responseId,
            toolCalls,
            ragSources: preState?.ragSources?.map(s => ({
              filename: s.filename,
              text: s.text,
              score: s.score,
              fileId: s.fileId,
              title: s.title,
              sourceUrl: s.sourceUrl,
              contentType: s.contentType,
              attributes: s.attributes,
            })),
            reasoning: preState?.reasoning,
            reasoningDuration: preState?.reasoningDuration,
            usage: preState?.usage,
          };

          onMessagesChange([...messagesRef.current, newMessage]);

          if (result.pendingApproval) {
            let parsedArguments: Record<string, unknown> = {};
            try {
              parsedArguments = JSON.parse(
                result.pendingApproval.arguments || '{}',
              );
            } catch {
              parsedArguments = { raw: result.pendingApproval.arguments };
            }
            preApprovalStateRef.current = null;
            setPendingApproval({
              approvalId: result.pendingApproval.approvalRequestId,
              responseId: result.responseId || '',
              toolCall: {
                callId: result.pendingApproval.approvalRequestId,
                name: result.pendingApproval.toolName,
                serverLabel:
                  result.pendingApproval.serverLabel || 'Unknown Server',
                arguments: result.pendingApproval.arguments || '{}',
                parsedArguments,
              },
              requestedAt: new Date().toISOString(),
              severity: getSeverity(result.pendingApproval.toolName),
            });
          } else {
            setPendingApproval(null);
            preApprovalStateRef.current = null;
            onClearStreamingState();
            onSetTyping(false);
          }
        }
      } catch (err) {
        debugError('Error approving tool:', err);
        if (mountedRef.current) {
          let msg: string;
          if (err instanceof DOMException && err.name === 'AbortError') {
            msg = 'Tool approval timed out after 60 seconds';
          } else if (err instanceof Error) {
            msg = err.message;
          } else {
            msg = 'Failed to approve tool execution';
          }
          setApprovalError(msg);
        }
      } finally {
        clearTimeout(timeoutId);
        submittingRef.current = false;
        if (mountedRef.current) {
          setIsApprovalSubmitting(false);
        }
      }
    },
    [
      api,
      pendingApproval,
      onMessagesChange,
      onClearStreamingState,
      onSetTyping,
    ],
  );

  const handleReject = useCallback(
    async (approvalId: string, reason?: string) => {
      if (!pendingApproval || submittingRef.current) return;

      submittingRef.current = true;
      setIsApprovalSubmitting(true);
      setApprovalError(null);

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        await api.submitToolApproval(
          pendingApproval.responseId,
          approvalId,
          false, // rejected
          undefined,
          undefined,
          controller.signal,
        );

        if (!mountedRef.current) return;

        const rejectedToolDisplay = stripToolPrefix(
          pendingApproval.toolCall.name,
          pendingApproval.toolCall.serverLabel,
        );

        setPendingApproval(null);
        preApprovalStateRef.current = null;

        const rejectionMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          text: `🚫 **Cancelled:** \`${rejectedToolDisplay}\`\n\n${
            reason
              ? `**Reason:** ${reason}`
              : 'The operation was cancelled by user.'
          }`,
          isUser: false,
          timestamp: new Date(),
        };
        onMessagesChange([...messagesRef.current, rejectionMessage]);
        onClearStreamingState();
        onSetTyping(false);
      } catch (err) {
        debugError('Error rejecting tool:', err);
        if (mountedRef.current) {
          let msg: string;
          if (err instanceof DOMException && err.name === 'AbortError') {
            msg = 'Tool rejection timed out after 60 seconds';
          } else if (err instanceof Error) {
            msg = err.message;
          } else {
            msg = 'Failed to reject tool execution';
          }
          setApprovalError(msg);
        }
      } finally {
        clearTimeout(timeoutId);
        submittingRef.current = false;
        if (mountedRef.current) {
          setIsApprovalSubmitting(false);
        }
      }
    },
    [
      api,
      pendingApproval,
      onMessagesChange,
      onClearStreamingState,
      onSetTyping,
    ],
  );

  return {
    pendingApproval,
    isApprovalSubmitting,
    approvalError,
    handleApprove,
    handleReject,
  };
}

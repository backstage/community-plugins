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
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import type { Message } from '../../types';
import { ChatMessage } from '../ChatMessage';

const OVERSCAN = 5;
const PLACEHOLDER_HEIGHT = 80;

interface VirtualizedMessageListProps {
  messages: Message[];
  onRegenerate?: () => void;
  onEditMessage?: (messageId: string, newText: string) => void;
}

/**
 * Lightweight message virtualization using IntersectionObserver.
 * Offscreen messages are replaced with placeholders preserving their
 * measured height. This avoids adding react-virtuoso as a dependency
 * while preventing DOM bloat in long conversations (100+ messages).
 *
 * The last OVERSCAN messages are always rendered to keep the active
 * conversation area responsive.
 */
export const VirtualizedMessageList = React.memo(
  function VirtualizedMessageList({
    messages,
    onRegenerate,
    onEditMessage,
  }: VirtualizedMessageListProps) {
    const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
    const heightMapRef = useRef<Map<string, number>>(new Map());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const nodeMapRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const prevFirstIdRef = useRef<string | undefined>(undefined);

    // Clear stale caches when the message set changes (session switch)
    const firstId = messages[0]?.id;
    if (firstId !== prevFirstIdRef.current) {
      prevFirstIdRef.current = firstId;
      if (visibleIds.size > 0) setVisibleIds(new Set());
      heightMapRef.current.clear();
    }

    const lastAssistantIndex = messages.reduce(
      (acc, m, i) => (!m.isUser ? i : acc),
      -1,
    );

    const alwaysVisibleStart = Math.max(0, messages.length - OVERSCAN);

    const observeNode = useCallback(
      (id: string, node: HTMLDivElement | null) => {
        if (node) {
          nodeMapRef.current.set(id, node);
          observerRef.current?.observe(node);
        } else {
          const prev = nodeMapRef.current.get(id);
          if (prev) observerRef.current?.unobserve(prev);
          nodeMapRef.current.delete(id);
        }
      },
      [],
    );

    useEffect(() => {
      observerRef.current = new IntersectionObserver(
        entries => {
          setVisibleIds(prev => {
            const next = new Set(prev);
            let changed = false;
            for (const entry of entries) {
              const id = (entry.target as HTMLElement).dataset.msgId;
              if (!id) continue;
              if (entry.isIntersecting) {
                if (!next.has(id)) {
                  next.add(id);
                  changed = true;
                }
                heightMapRef.current.set(
                  id,
                  entry.target.getBoundingClientRect().height,
                );
              } else {
                if (next.has(id)) {
                  next.delete(id);
                  changed = true;
                }
              }
            }
            return changed ? next : prev;
          });
        },
        { rootMargin: '200px 0px' },
      );

      return () => {
        observerRef.current?.disconnect();
      };
    }, []);

    if (messages.length <= 30) {
      return (
        <>
          {messages.map((message, index) => {
            const isLastAssistant =
              !message.isUser && index === lastAssistantIndex;
            return (
              <ChatMessage
                key={message.id}
                message={message}
                isLastAssistantMessage={isLastAssistant}
                onRegenerate={isLastAssistant ? onRegenerate : undefined}
                onEditMessage={message.isUser ? onEditMessage : undefined}
              />
            );
          })}
        </>
      );
    }

    return (
      <>
        {messages.map((message, index) => {
          const isAlwaysVisible = index >= alwaysVisibleStart;
          const isVisible = isAlwaysVisible || visibleIds.has(message.id);
          const isLastAssistant =
            !message.isUser && index === lastAssistantIndex;

          if (!isVisible) {
            const h =
              heightMapRef.current.get(message.id) ?? PLACEHOLDER_HEIGHT;
            return (
              <Box
                key={message.id}
                data-msg-id={message.id}
                ref={(node: HTMLDivElement | null) =>
                  observeNode(message.id, node)
                }
                sx={{ height: h, flexShrink: 0 }}
              />
            );
          }

          return (
            <Box
              key={message.id}
              data-msg-id={message.id}
              ref={(node: HTMLDivElement | null) =>
                observeNode(message.id, node)
              }
            >
              <ChatMessage
                message={message}
                isLastAssistantMessage={isLastAssistant}
                onRegenerate={isLastAssistant ? onRegenerate : undefined}
                onEditMessage={message.isUser ? onEditMessage : undefined}
              />
            </Box>
          );
        })}
      </>
    );
  },
);

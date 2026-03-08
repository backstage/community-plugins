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
import { useEffect, type RefObject } from 'react';

interface UseChatKeyboardShortcutsOptions {
  onNewChat?: () => void;
  isTyping: boolean;
  cancelRequest: () => void;
  chatInputRef: RefObject<HTMLTextAreaElement | null>;
}

/**
 * Registers global keyboard shortcuts for the chat interface:
 * - Cmd/Ctrl+Shift+O → New Chat
 * - Escape → Cancel streaming
 * - "/" → Focus input
 */
export function useChatKeyboardShortcuts({
  onNewChat,
  isTyping,
  cancelRequest,
  chatInputRef,
}: UseChatKeyboardShortcutsOptions): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isMod && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        onNewChat?.();
        return;
      }

      if (e.key === 'Escape' && isTyping) {
        e.preventDefault();
        cancelRequest();
        return;
      }

      if (e.key === '/' && !isEditing && !isMod) {
        e.preventDefault();
        chatInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewChat, isTyping, cancelRequest, chatInputRef]);
}

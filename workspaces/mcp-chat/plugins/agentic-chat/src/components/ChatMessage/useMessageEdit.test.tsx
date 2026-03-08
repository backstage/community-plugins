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

import { renderHook, act } from '@testing-library/react';
import { useMessageEdit } from './useMessageEdit';

describe('useMessageEdit', () => {
  const messageId = 'msg-1';
  const initialText = 'Original message';

  describe('initial state', () => {
    it('starts with isEditing false and editText matching messageText', () => {
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText),
      );

      expect(result.current.isEditing).toBe(false);
      expect(result.current.editText).toBe(initialText);
    });
  });

  describe('handleStartEdit', () => {
    it('sets isEditing to true and resets editText to messageText', () => {
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText),
      );

      act(() => {
        result.current.setEditText('Modified');
      });
      expect(result.current.editText).toBe('Modified');

      act(() => {
        result.current.handleStartEdit();
      });

      expect(result.current.isEditing).toBe(true);
      expect(result.current.editText).toBe(initialText);
    });
  });

  describe('handleCancelEdit', () => {
    it('sets isEditing to false and restores editText to messageText', () => {
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText),
      );

      act(() => {
        result.current.handleStartEdit();
        result.current.setEditText('Changed');
      });

      act(() => {
        result.current.handleCancelEdit();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.editText).toBe(initialText);
    });
  });

  describe('handleSubmitEdit', () => {
    it('calls onEditMessage when text changed and trimmed', () => {
      const onEditMessage = jest.fn();
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText, onEditMessage),
      );

      act(() => {
        result.current.handleStartEdit();
        result.current.setEditText('  New content  ');
      });

      act(() => {
        result.current.handleSubmitEdit();
      });

      expect(onEditMessage).toHaveBeenCalledWith(messageId, 'New content');
      expect(result.current.isEditing).toBe(false);
    });

    it('does not call onEditMessage when text unchanged', () => {
      const onEditMessage = jest.fn();
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText, onEditMessage),
      );

      act(() => {
        result.current.handleStartEdit();
      });

      act(() => {
        result.current.handleSubmitEdit();
      });

      expect(onEditMessage).not.toHaveBeenCalled();
      expect(result.current.isEditing).toBe(false);
    });

    it('does not call onEditMessage when text is empty after trim', () => {
      const onEditMessage = jest.fn();
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText, onEditMessage),
      );

      act(() => {
        result.current.handleStartEdit();
        result.current.setEditText('   ');
      });

      act(() => {
        result.current.handleSubmitEdit();
      });

      expect(onEditMessage).not.toHaveBeenCalled();
      expect(result.current.isEditing).toBe(false);
    });

    it('exits edit mode even when onEditMessage is undefined', () => {
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText),
      );

      act(() => {
        result.current.handleStartEdit();
        result.current.setEditText('Different');
      });

      act(() => {
        result.current.handleSubmitEdit();
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('handleEditKeyDown', () => {
    it('submits on Enter without Shift', () => {
      const onEditMessage = jest.fn();
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText, onEditMessage),
      );

      act(() => {
        result.current.handleStartEdit();
        result.current.setEditText('Updated');
      });

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: false,
      });
      Object.defineProperty(enterEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        result.current.handleEditKeyDown(
          enterEvent as unknown as React.KeyboardEvent,
        );
      });

      expect(onEditMessage).toHaveBeenCalledWith(messageId, 'Updated');
      expect(result.current.isEditing).toBe(false);
    });

    it('cancels on Escape', () => {
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText),
      );

      act(() => {
        result.current.handleStartEdit();
        result.current.setEditText('Will cancel');
      });

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      act(() => {
        result.current.handleEditKeyDown(
          escapeEvent as unknown as React.KeyboardEvent,
        );
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.editText).toBe(initialText);
    });
  });

  describe('sync with messageText', () => {
    it('updates editText when messageText prop changes', () => {
      const { result, rerender } = renderHook(
        ({ messageText }) => useMessageEdit(messageId, messageText),
        { initialProps: { messageText: initialText } },
      );

      expect(result.current.editText).toBe(initialText);

      rerender({ messageText: 'Updated from parent' });

      expect(result.current.editText).toBe('Updated from parent');
    });
  });

  describe('setEditText', () => {
    it('updates editText', () => {
      const { result } = renderHook(() =>
        useMessageEdit(messageId, initialText),
      );

      act(() => {
        result.current.setEditText('Custom text');
      });

      expect(result.current.editText).toBe('Custom text');
    });
  });
});

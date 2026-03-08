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

import { renderHook } from '@testing-library/react';
import { useApprovalKeyboardShortcuts } from './useApprovalKeyboardShortcuts';

function dispatchKeyDown(key: string, options?: { shiftKey?: boolean }) {
  const event = new KeyboardEvent('keydown', {
    key,
    shiftKey: options?.shiftKey ?? false,
    bubbles: true,
  });
  Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
  window.dispatchEvent(event);
  return event;
}

describe('useApprovalKeyboardShortcuts', () => {
  let onApprove: jest.Mock;
  let onReject: jest.Mock;

  beforeEach(() => {
    onApprove = jest.fn();
    onReject = jest.fn();
  });

  it('calls onApprove when Enter is pressed', () => {
    renderHook(() => useApprovalKeyboardShortcuts(onApprove, onReject, false));

    dispatchKeyDown('Enter');

    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
  });

  it('calls onReject when Escape is pressed', () => {
    renderHook(() => useApprovalKeyboardShortcuts(onApprove, onReject, false));

    dispatchKeyDown('Escape');

    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onApprove).not.toHaveBeenCalled();
  });

  it('does not call onApprove or onReject when isSubmitting is true', () => {
    renderHook(() => useApprovalKeyboardShortcuts(onApprove, onReject, true));

    dispatchKeyDown('Enter');
    dispatchKeyDown('Escape');

    expect(onApprove).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
  });

  it('does not call handlers when user is typing in an input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    renderHook(() => useApprovalKeyboardShortcuts(onApprove, onReject, false));

    // Dispatch on input so event.target is the input element
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    input.dispatchEvent(enterEvent);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    input.dispatchEvent(escapeEvent);

    expect(onApprove).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('does not call handlers when user is typing in a textarea', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    renderHook(() => useApprovalKeyboardShortcuts(onApprove, onReject, false));

    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    textarea.dispatchEvent(enterEvent);

    expect(onApprove).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useApprovalKeyboardShortcuts(onApprove, onReject, false),
    );

    unmount();
    dispatchKeyDown('Enter');
    dispatchKeyDown('Escape');

    expect(onApprove).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
  });
});

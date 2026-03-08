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
import { useScrollToBottom } from './useScrollToBottom';

describe('useScrollToBottom', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('returns showScrollFab false when near bottom (isAtBottom true)', () => {
    const scrollContainerRef = { current: document.createElement('div') };
    const messagesEndRef = { current: document.createElement('div') };

    Object.defineProperties(scrollContainerRef.current, {
      scrollHeight: { value: 1000, configurable: true },
      scrollTop: { value: 920, configurable: true },
      clientHeight: { value: 100, configurable: true },
    });

    const { result } = renderHook(() =>
      useScrollToBottom(scrollContainerRef, messagesEndRef, []),
    );

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.showScrollFab).toBe(false);
  });

  it('returns showScrollFab true when scrolled up (isAtBottom false)', () => {
    const scrollContainerRef = { current: document.createElement('div') };
    const messagesEndRef = { current: document.createElement('div') };

    Object.defineProperties(scrollContainerRef.current, {
      scrollHeight: { value: 1000, configurable: true },
      scrollTop: { value: 0, configurable: true },
      clientHeight: { value: 100, configurable: true },
    });

    const { result } = renderHook(() =>
      useScrollToBottom(scrollContainerRef, messagesEndRef, []),
    );

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.showScrollFab).toBe(true);
  });

  it('scrollToBottom function calls scrollIntoView on the messagesEndRef', () => {
    const scrollContainerRef = { current: document.createElement('div') };
    const messagesEndRef = { current: document.createElement('div') };
    const scrollIntoViewMock = jest.fn();
    messagesEndRef.current.scrollIntoView = scrollIntoViewMock;

    const { result } = renderHook(() =>
      useScrollToBottom(scrollContainerRef, messagesEndRef, []),
    );

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('scrollToBottom with default behavior uses smooth', () => {
    const scrollContainerRef = { current: document.createElement('div') };
    const messagesEndRef = { current: document.createElement('div') };
    const scrollIntoViewMock = jest.fn();
    messagesEndRef.current.scrollIntoView = scrollIntoViewMock;

    const { result } = renderHook(() =>
      useScrollToBottom(scrollContainerRef, messagesEndRef, []),
    );

    act(() => {
      result.current.scrollToBottom();
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});

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
import { useIsIframeLoading } from './useIsIframeLoading';

describe('useIsIframeLoading', () => {
  let iframe: HTMLIFrameElement;
  let ref: React.RefObject<HTMLIFrameElement>;

  beforeEach(() => {
    iframe = document.createElement('iframe');
    ref = { current: iframe };
    // Ensure not in dev mode for tests
    process.env.NODE_ENV = 'test';
  });

  it('should export hook', () => {
    expect(useIsIframeLoading).toBeDefined();
  });

  it('should be true after mount and false after load', () => {
    const { result } = renderHook(() => useIsIframeLoading(ref, 'about:blank'));
    expect(result.current).toBe(true);

    act(() => {
      iframe.dispatchEvent(new Event('load'));
    });
    expect(result.current).toBe(false);
  });

  it('should be false after error event', () => {
    const { result } = renderHook(() => useIsIframeLoading(ref, 'about:blank'));
    expect(result.current).toBe(true);

    act(() => {
      iframe.dispatchEvent(new Event('error'));
    });
    expect(result.current).toBe(false);
  });

  it('should not be loading if no iframe', () => {
    const { result } = renderHook(() =>
      useIsIframeLoading({ current: null }, 'about:blank'),
    );
    expect(result.current).toBe(false);
  });

  it('should set loading to true when src changes', () => {
    let src = 'about:blank';

    const { result, rerender } = renderHook(() => useIsIframeLoading(ref, src));
    expect(result.current).toBe(true);
    act(() => {
      iframe.dispatchEvent(new Event('load'));
    });
    expect(result.current).toBe(false);

    // change the src
    src = 'https://example.com';
    rerender();
    expect(result.current).toBe(true);

    act(() => {
      iframe.dispatchEvent(new Event('load'));
    });
    expect(result.current).toBe(false);
  });
});

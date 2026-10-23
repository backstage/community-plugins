/*
 * Copyright 2026 The Backstage Authors
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
import { act, renderHook, waitFor } from '@testing-library/react';
import { useElementRect, useTargetElement } from './useTargetElement';

describe('useTargetElement', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('finds an existing element at once and reports none without a selector', () => {
    const el = document.createElement('div');
    el.setAttribute('data-guided-tour', 'x');
    document.body.appendChild(el);

    const found = renderHook(() => useTargetElement('[data-guided-tour="x"]'));
    expect(found.result.current).toEqual({ element: el, status: 'found' });

    const none = renderHook(() => useTargetElement(undefined));
    expect(none.result.current).toEqual({ element: null, status: 'none' });

    const disabled = renderHook(() =>
      useTargetElement('[data-guided-tour="x"]', { enabled: false }),
    );
    expect(disabled.result.current.status).toBe('resolving');
  });

  it('waits for the element to appear and gives up after the timeout', async () => {
    const { result } = renderHook(() =>
      useTargetElement('#late', { timeoutMs: 50 }),
    );
    expect(result.current.status).toBe('resolving');

    const el = document.createElement('div');
    el.id = 'late';
    act(() => {
      document.body.appendChild(el);
    });
    await waitFor(() => expect(result.current.status).toBe('found'));
    expect(result.current.element).toBe(el);

    const missing = renderHook(() =>
      useTargetElement('#never', { timeoutMs: 20 }),
    );
    await waitFor(() =>
      expect(missing.result.current).toEqual({
        element: null,
        status: 'missing',
      }),
    );
  });
});

const box = (left: number, top: number, width: number, height: number) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  } as DOMRect);

describe('useElementRect', () => {
  beforeAll(() => {
    // jsdom 20 has no DOMRect; the hook builds one for display:contents wrappers
    if (typeof DOMRect === 'undefined') {
      (globalThis as any).DOMRect = class {
        constructor(
          public x: number,
          public y: number,
          public width: number,
          public height: number,
        ) {}
        get left() {
          return this.x;
        }
        get top() {
          return this.y;
        }
      };
    }
  });

  it('measures the element, unions display:contents children and clears on null', async () => {
    const wrapper = document.createElement('span');
    const a = document.createElement('button');
    const b = document.createElement('button');
    wrapper.append(a, b);
    document.body.appendChild(wrapper);
    wrapper.getBoundingClientRect = () => box(0, 0, 0, 0);
    a.getBoundingClientRect = () => box(10, 20, 30, 10);
    b.getBoundingClientRect = () => box(50, 25, 20, 15);
    wrapper.scrollIntoView = jest.fn();

    const { result, rerender } = renderHook(
      (el: HTMLElement | null) => useElementRect(el),
      { initialProps: wrapper as HTMLElement | null },
    );
    await waitFor(() =>
      expect(result.current).toEqual({
        top: 20,
        left: 10,
        width: 60,
        height: 20,
      }),
    );
    expect(wrapper.scrollIntoView).toHaveBeenCalled();

    const plain = document.createElement('div');
    plain.getBoundingClientRect = () => box(1, 2, 3, 4);
    rerender(plain);
    await waitFor(() =>
      expect(result.current).toEqual({ top: 2, left: 1, width: 3, height: 4 }),
    );

    rerender(null);
    expect(result.current).toBeNull();
  });
});

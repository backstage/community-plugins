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
import { useEffect, useState } from 'react';

export type TargetStatus = 'none' | 'resolving' | 'found' | 'missing';

export interface TargetResult {
  element: HTMLElement | null;
  status: TargetStatus;
}

/**
 * Resolves a CSS selector to an element, waiting for it to appear (lazy
 * pages, navigation) until `timeoutMs` elapses.
 */
export function useTargetElement(
  selector: string | undefined,
  options: { enabled?: boolean; timeoutMs?: number; resetKey?: string } = {},
): TargetResult {
  const { enabled = true, timeoutMs = 5000, resetKey } = options;
  const initial = (): TargetResult & { key?: string } => ({
    element: null,
    status: selector ? 'resolving' : 'none',
    key: resetKey,
  });
  const [stored, setStored] = useState(initial);
  // a result that belongs to another step (stale until the effect below runs)
  // must not leak into the new step, e.g. a `missing` that would skip it
  const result = stored.key === resetKey ? stored : initial();
  const setResult = (next: TargetResult) =>
    setStored({ ...next, key: resetKey });

  useEffect(() => {
    if (!selector) {
      setResult({ element: null, status: 'none' });
      return undefined;
    }
    if (!enabled) {
      setResult({ element: null, status: 'resolving' });
      return undefined;
    }

    const find = () => document.querySelector<HTMLElement>(selector);
    const existing = find();
    if (existing) {
      setResult({ element: existing, status: 'found' });
      return undefined;
    }
    setResult({ element: null, status: 'resolving' });

    const timer: { id?: ReturnType<typeof setTimeout> } = {};
    const observer = new MutationObserver(() => {
      const el = find();
      if (el) {
        observer.disconnect();
        clearTimeout(timer.id);
        setResult({ element: el, status: 'found' });
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-guided-tour'],
    });
    timer.id = setTimeout(() => {
      observer.disconnect();
      setResult({ element: null, status: 'missing' });
    }, timeoutMs);

    return () => {
      observer.disconnect();
      clearTimeout(timer.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, enabled, timeoutMs, resetKey]);

  return { element: result.element, status: result.status };
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(element: HTMLElement): Rect {
  let rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0 && element.children.length > 0) {
    // display: contents wrappers have no box; use the union of their children
    const boxes = Array.from(element.children).map(c =>
      c.getBoundingClientRect(),
    );
    const top = Math.min(...boxes.map(b => b.top));
    const left = Math.min(...boxes.map(b => b.left));
    const bottom = Math.max(...boxes.map(b => b.bottom));
    const right = Math.max(...boxes.map(b => b.right));
    rect = new DOMRect(left, top, right - left, bottom - top);
  }
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Tracks the viewport rectangle of an element across scroll, resize and
 * layout changes. Scrolls the element into view once.
 */
export function useElementRect(element: HTMLElement | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!element) {
      setRect(null);
      return undefined;
    }
    if (typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'center', inline: 'nearest' });
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect(measure(element)));
    };
    update();

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(update)
        : undefined;
    resizeObserver?.observe(element);
    resizeObserver?.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      resizeObserver?.disconnect();
    };
  }, [element]);

  return rect;
}

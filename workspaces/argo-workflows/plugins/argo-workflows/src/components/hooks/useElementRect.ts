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
import type { RefObject } from 'react';

/** An element's rendered size and its offset within the viewport. */
export interface ElementRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function areEqual(a: ElementRect, b: ElementRect): boolean {
  return (
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height
  );
}

/**
 * Reports an element's viewport rectangle, keeping it current as the element
 * resizes.
 *
 * Exists because reading `ref.current.getBoundingClientRect()` during render is
 * not reactive: the ref is `null` on the first pass, so anything derived from it
 * never paints until an unrelated state change forces a re-render.
 *
 * Two listeners are needed, and they cover different failures:
 *  - `resize` on the window, for the browser window changing.
 *  - a `ResizeObserver` on the element, for layout shifts that do not resize the
 *    window — collapsing the Backstage sidebar being the motivating case.
 *
 * Returns `null` until the first measurement lands.
 */
export function useElementRect(
  ref: RefObject<Element | null>,
): ElementRect | null {
  const [rect, setRect] = useState<ElementRect | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const measure = () => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const next = { left, top, width, height };
      // Bail out when nothing moved, so observer callbacks caused by unrelated
      // layout work do not trigger re-renders.
      setRect(prev => (prev && areEqual(prev, next) ? prev : next));
    };

    measure();
    window.addEventListener('resize', measure);

    // Absent under jsdom, where the single initial measurement is enough.
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(element);

    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [ref]);

  return rect;
}

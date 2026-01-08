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
import { useEffect, useMemo, useRef, useState } from 'react';

import { useResizeObserver } from './useResizeObserver';

/** @public */
export interface UsePositionClientSize {
  width: number;
  height: number;
}

/** @public */
export interface UsePositionElementPosition {
  left: number;
  top: number;
}

/** @public */
export interface UsePositionResult {
  client: UsePositionClientSize;
  element: UsePositionElementPosition;
}

/**
 * Calculate the position of an element, and the size of the client window.
 * @public
 */
export function usePosition(element: Element | undefined) {
  const mountedRef = useRef(false);

  const [clientSize, setClientSize] = useState<
    UsePositionClientSize | undefined
  >(undefined);
  const [elementPos, setElementPos] = useState<
    UsePositionElementPosition | undefined
  >(undefined);

  useResizeObserver(entry => {
    requestAnimationFrame(() => {
      if (!mountedRef.current) {
        return;
      }

      const divRect = entry.target.getBoundingClientRect();
      setElementPos({
        left: divRect.left,
        top: divRect.top,
      });
    });
  }, element);

  useResizeObserver(entry => {
    requestAnimationFrame(() => {
      if (!mountedRef.current) {
        return;
      }

      setClientSize({
        height: entry.contentRect.height,
        width: entry.contentRect.width,
      });
    });
  }, window.document.documentElement);

  useEffect(() => {
    // Set initial sizes
    const divRect = element?.getBoundingClientRect();
    if (divRect) {
      setElementPos({
        left: divRect.left,
        top: divRect.top,
      });
    }
    const windowRect = window.document.documentElement.getBoundingClientRect();
    setClientSize({
      height: windowRect.height,
      width: windowRect.width,
    });

    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [element]);

  const result = useMemo((): UsePositionResult | undefined => {
    if (!clientSize || !elementPos) {
      return undefined;
    }
    return {
      client: clientSize,
      element: elementPos,
    };
  }, [clientSize, elementPos]);

  return result;
}

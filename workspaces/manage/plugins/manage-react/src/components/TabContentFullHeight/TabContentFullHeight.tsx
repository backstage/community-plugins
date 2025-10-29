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
import {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { usePosition } from './usePosition';
import { useMutationObserver } from './useMutationObserver';

/**
 * Props for {@link TabContentFullHeight}
 *
 * @public
 */
export interface TabContentFullHeightProps {
  /**
   * Bottom margin.
   *
   * Defaults to 48px (24px for the page and 24px for the tabbed content)
   */
  bottomMargin?: number;

  /**
   * Set to true, to also resize the first child element (unless it's a progress
   * bar). This is useful to e.g. force a Table component to be full-height.
   */
  resizeChild?: boolean;
}

/** @public */
export function ManageTabContentFullHeight({
  children,
  bottomMargin = 48,
  resizeChild,
}: PropsWithChildren<TabContentFullHeightProps>) {
  const [element, setElement] = useState<Element | undefined>(undefined);

  const rect = usePosition(element);

  const childHeight = useMemo(() => {
    return !rect
      ? undefined
      : rect.client.height - rect.element.top - bottomMargin;
  }, [rect, bottomMargin]);

  const style = useMemo((): CSSProperties => {
    if (typeof childHeight === 'undefined') {
      return {};
    }
    return {
      height: childHeight,
    };
  }, [childHeight]);

  const mutation = useMutationObserver(element);

  useEffect(() => {
    if (resizeChild && element && element.children.length === 1) {
      const child = element.children.item(0) as HTMLElement;
      if (child.role !== 'progressbar') {
        child.style.height = `${childHeight}px`;
      }
    }
  }, [resizeChild, mutation, element, childHeight]);

  const setRef = useCallback((el: Element | null) => {
    setElement(el ?? undefined);
  }, []);

  return (
    <div ref={setRef} style={style}>
      {children}
    </div>
  );
}

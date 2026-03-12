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

import { Container } from '@backstage/ui';

import { usePosition } from './usePosition';
import { useMutationObserver } from './useMutationObserver';

/**
 * Props for {@link TabContent}
 *
 * @internal
 */
export interface TabContentProps {
  /**
   * Whether the content should be full height.
   */
  fullHeight: boolean;

  /**
   * Set to true, to also resize the first child element (unless it's a progress
   * bar). This is useful to e.g. force a Table component to be full-height.
   */
  resizeChild?: boolean;
}

/**
 * The content container for a tab. If the `fullHeight` prop is true, the
 * container will be full height and the children will be resized to fill the
 * available space.
 *
 * @internal
 */
export function TabContent(props: PropsWithChildren<TabContentProps>) {
  if (props.fullHeight) {
    return <TabContentFullHeight {...props} />;
  }
  return <Container my="5">{props.children}</Container>;
}

export function TabContentFullHeight(
  props: PropsWithChildren<TabContentProps>,
) {
  const { children, resizeChild } = props;

  const bottomMargin = 'var(--bui-space-5)';

  const [element, setElement] = useState<Element | undefined>(undefined);

  const rect = usePosition(element);

  const childHeight = useMemo(() => {
    if (!rect) {
      return undefined;
    }

    const viewportFullHeight = rect.client.height - rect.element.top;

    const bottomMarginWithUnit =
      typeof bottomMargin === 'number' ? `${bottomMargin}px` : bottomMargin;

    return `calc(${viewportFullHeight}px - ${bottomMarginWithUnit})`;
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
      if (child.role !== 'progressbar' && childHeight) {
        child.style.height = childHeight;
      }
    }
  }, [resizeChild, mutation, element, childHeight]);

  const setRef = useCallback((el: Element | null) => {
    setElement(el ?? undefined);
  }, []);

  return (
    <Container ref={setRef} my="5" style={style}>
      {children}
    </Container>
  );
}

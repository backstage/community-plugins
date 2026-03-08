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
  useState,
  useRef,
  useCallback,
  useEffect,
  type RefObject,
} from 'react';

const BOTTOM_THRESHOLD = 80;

/**
 * Manages scroll-to-bottom behavior for a chat-style scrollable container.
 * Tracks whether the user is near the bottom and auto-scrolls on new messages.
 */
export function useScrollToBottom(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
  messagesEndRef: RefObject<HTMLDivElement | null>,
  deps: readonly unknown[],
) {
  const [showScrollFab, setShowScrollFab] = useState(false);
  const isNearBottomRef = useRef(true);
  const prevFirstDepRef = useRef<unknown>(undefined);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    },
    [messagesEndRef],
  );

  const resetScroll = useCallback(() => {
    isNearBottomRef.current = true;
    setShowScrollFab(false);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distFromBottom < BOTTOM_THRESHOLD;
    isNearBottomRef.current = nearBottom;
    setShowScrollFab(!nearBottom);
  }, [scrollContainerRef]);

  useEffect(() => {
    // When the message set changes entirely (session switch, new chat),
    // force scroll to bottom regardless of previous scroll position.
    const firstDep = deps[0];
    const isNewMessageSet =
      Array.isArray(firstDep) && prevFirstDepRef.current !== firstDep;
    if (isNewMessageSet) {
      prevFirstDepRef.current = firstDep;
      isNearBottomRef.current = true;
      setShowScrollFab(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }

    if (isNearBottomRef.current) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, scrollToBottom]);

  return { showScrollFab, scrollToBottom, handleScroll, resetScroll };
}

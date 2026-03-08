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

import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseStreamingStateBatchingOptions {
  /** Called when a batched update is flushed (e.g. to scroll to bottom) */
  onFlush?: () => void;
}

/**
 * Hook to batch state updates using requestAnimationFrame.
 * Queues updates and flushes once per frame to avoid excessive re-renders during streaming.
 */
export function useStreamingStateBatching<T>(
  initialState: T,
  options?: UseStreamingStateBatchingOptions,
) {
  const [state, setState] = useState<T>(initialState);
  const pendingStateRef = useRef<T | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const onFlushRef = useRef(options?.onFlush);
  onFlushRef.current = options?.onFlush;

  const flushStreamingState = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (pendingStateRef.current !== null) {
      setState(
        typeof pendingStateRef.current === 'object' &&
          pendingStateRef.current !== null
          ? { ...pendingStateRef.current }
          : pendingStateRef.current,
      );
    }
  }, []);

  const scheduleStreamingUpdate = useCallback((updates: T) => {
    pendingStateRef.current = updates;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (pendingStateRef.current !== null) {
          const next =
            typeof pendingStateRef.current === 'object' &&
            pendingStateRef.current !== null
              ? { ...pendingStateRef.current }
              : pendingStateRef.current;
          setState(next);
          onFlushRef.current?.();
        }
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    state,
    setState,
    scheduleStreamingUpdate,
    flushStreamingState,
    pendingStateRef,
  };
}

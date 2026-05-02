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

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChatResponse } from '../types';

/**
 * @public
 */
export interface UseApiRequestReturn {
  isTyping: boolean;
  execute: (
    apiCall: (signal: AbortSignal) => Promise<ChatResponse>,
    onSuccess: (response: ChatResponse) => void,
    onError?: (err: Error) => void,
  ) => Promise<void>;
  cancelOngoingRequest: () => void;
}

/**
 * Manages the shared abort/typing/error lifecycle for API requests.
 * @public
 */
export function useApiRequest(): UseApiRequestReturn {
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelOngoingRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (
      apiCall: (signal: AbortSignal) => Promise<ChatResponse>,
      onSuccess: (response: ChatResponse) => void,
      onError?: (err: Error) => void,
    ) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsTyping(true);

      try {
        const response = await apiCall(abortControllerRef.current.signal);

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setIsTyping(false);
        abortControllerRef.current = null;
        onSuccess(response);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // eslint-disable-next-line no-console
          console.error('Request was cancelled');
          return;
        }

        setIsTyping(false);
        abortControllerRef.current = null;

        if (onError && err instanceof Error) {
          onError(err);
        } else {
          // eslint-disable-next-line no-console
          console.error('API request failed:', err);
        }
      }
    },
    [],
  );

  return { isTyping, execute, cancelOngoingRequest };
}

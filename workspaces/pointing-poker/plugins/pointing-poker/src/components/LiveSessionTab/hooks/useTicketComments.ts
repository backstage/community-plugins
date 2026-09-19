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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAsync } from 'react-use';
import {
  errorApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import type {
  CommentSegment,
  TicketComment,
} from '@backstage-community/plugin-pointing-poker-common';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';

export const useTicketComments = (ticketKey?: string) => {
  const api = useApi(pointingPokerApiRef);
  const identityApi = useApi(identityApiRef);
  const errorApi = useApi(errorApiRef);
  const [refreshToken, setRefreshToken] = useState(0);
  const [pending, setPending] = useState<TicketComment[]>([]);
  const pendingIdRef = useRef(0);
  const authorNameRef = useRef<string>('You');

  useEffect(() => {
    let cancelled = false;
    identityApi.getProfileInfo().then(profile => {
      if (!cancelled) {
        authorNameRef.current = profile.displayName ?? profile.email ?? 'You';
      }
    });
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  const { loading, value: serverComments } = useAsync(async () => {
    if (!ticketKey) {
      return [];
    }
    return api.getComments(ticketKey);
  }, [api, ticketKey, refreshToken]);

  const addComment = useCallback(
    (segments: CommentSegment[], plainText: string) => {
      const trimmed = plainText.trim();
      if (!ticketKey || segments.length === 0 || !trimmed) {
        return;
      }

      const id = `pending-${(pendingIdRef.current += 1)}`;
      const optimistic: TicketComment = {
        author: authorNameRef.current,
        body: trimmed,
        createdAt: new Date().toISOString(),
        id,
      };
      setPending(current => [...current, optimistic]);

      void (async () => {
        try {
          await api.postComment(ticketKey, segments, authorNameRef.current);
          setPending(current => current.filter(comment => comment.id !== id));
          setRefreshToken(token => token + 1);
        } catch (error) {
          setPending(current => current.filter(comment => comment.id !== id));
          errorApi.post(
            error instanceof Error
              ? error
              : new Error('Failed to post comment'),
          );
        }
      })();
    },
    [api, errorApi, ticketKey],
  );

  return {
    addComment,
    comments: [...(serverComments ?? []), ...pending],
    loading,
  };
};

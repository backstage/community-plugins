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
import { useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';
import type { Session } from '@backstage-community/plugin-pointing-poker-common';

const POLL_MS = 3500;
const HEARTBEAT_MS = 15000;

export function useSession(sessionId: string | null, userId: string) {
  const api = useApi(pointingPokerApiRef);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      return undefined;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const s = await api.getSession(sessionId);
        if (!cancelled) setSession(s);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);

    heartbeatRef.current = setInterval(() => {
      if (!cancelled && userId) {
        api.heartbeat(sessionId, userId).catch(() => undefined);
      }
    }, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearInterval(heartbeatRef.current);
    };
  }, [sessionId, userId, api]);

  return { session, setSession, error };
}

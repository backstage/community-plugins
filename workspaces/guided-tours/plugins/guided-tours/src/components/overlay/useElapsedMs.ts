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

/**
 * Milliseconds since `active` became true, updated every `intervalMs`.
 * Resets to 0 when `active` turns false or `key` changes.
 */
export function useElapsedMs(
  active: boolean,
  key?: string,
  intervalMs = 100,
): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (!active) {
      return undefined;
    }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), intervalMs);
    return () => clearInterval(id);
  }, [active, key, intervalMs]);

  return active ? elapsed : 0;
}

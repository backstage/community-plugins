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
import { useEffect, useRef } from 'react';

/**
 * Synchronizes a remote config value into local state once it finishes loading.
 *
 * Replaces the repeated pattern:
 * ```
 * if (!initialized && !loading) {
 *   setLocalState(entry);
 *   setInitialized(true);
 * }
 * ```
 *
 * @param loading  - Whether the remote config is still loading
 * @param value    - The remote config value (may be null/undefined while loading)
 * @param apply    - Callback to apply the remote value to local state
 */
export function useConfigSync<T>(
  loading: boolean,
  value: T | null | undefined,
  apply: (v: T) => void,
): void {
  const appliedRef = useRef(false);

  useEffect(() => {
    if (!loading && !appliedRef.current && value != null) {
      apply(value);
      appliedRef.current = true;
    }
  }, [loading, value, apply]);

  useEffect(() => {
    appliedRef.current = false;
  }, [apply]);
}

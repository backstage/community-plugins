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
import { useApiHolder } from '@backstage/frontend-plugin-api';
import { useCallback, useSyncExternalStore } from 'react';
import {
  GuidedTourProgress,
  GuidedTourStartOptions,
  guidedTourApiRef,
} from '../api';

/**
 * Result of {@link useGuidedTour}.
 *
 * @public
 */
export interface UseGuidedTourResult {
  /** False when the guided tour plugin is not installed or the tour is unknown. */
  available: boolean;
  /** Whether this tour is currently running. */
  active: boolean;
  /** Saved progress for the current user, if any. */
  progress?: GuidedTourProgress;
  /** Starts the tour. A no-op when not available. */
  start(options?: GuidedTourStartOptions): void;
}

const noop = () => {};
const noopSubscribe = () => noop;

/**
 * Lets a plugin start or inspect one of its tours. Safe to use in plugins
 * that do not depend on the guided tour plugin: everything becomes a no-op.
 *
 * @public
 */
export function useGuidedTour(id: string): UseGuidedTourResult {
  const api = useApiHolder().get(guidedTourApiRef);
  const snapshot = useSyncExternalStore(
    api ? api.subscribe : noopSubscribe,
    api ? api.getSnapshot : () => undefined,
    api ? api.getSnapshot : () => undefined,
  );

  const start = useCallback(
    (options?: GuidedTourStartOptions) => api?.start(id, options),
    [api, id],
  );

  return {
    available: !!api?.getTour(id),
    active: snapshot?.state.activeTourId === id,
    progress: api?.getProgress(id),
    start,
  };
}

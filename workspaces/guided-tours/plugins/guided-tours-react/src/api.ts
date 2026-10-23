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
import { createApiRef } from '@backstage/frontend-plugin-api';
import { GuidedTour } from './types';

/**
 * Saved progress of one tour for the current user.
 *
 * @public
 */
export interface GuidedTourProgress {
  /** Where the user left the tour. */
  status: 'in-progress' | 'completed' | 'dismissed';
  /** Index of the step that was shown last. */
  stepIndex: number;
  /** Version of the tour the progress was written for. */
  version: number;
  /** ISO timestamp of the last change. */
  updatedAt: string;
}

/**
 * The currently running tour, if any, and the tours queued after it.
 *
 * @public
 */
export interface GuidedTourRunnerState {
  /** Id of the running tour; undefined while no tour runs. */
  activeTourId?: string;
  /** Index of the step currently shown. */
  stepIndex: number;
  /** Ids of the tours that play after the running one. */
  queue: string[];
}

/**
 * Immutable snapshot of everything the guided tour API knows. A new object
 * is produced on every change, which makes it suitable for
 * `useSyncExternalStore`.
 *
 * @public
 */
export interface GuidedTourSnapshot {
  /** True once the per-user progress has been loaded from storage. */
  ready: boolean;
  /** True once the user has gone through (or dismissed) the login sequence. */
  onboarded: boolean;
  /** The running tour and its queue. */
  state: GuidedTourRunnerState;
  /** Saved progress by tour id, including entries of older tour versions. */
  progress: Record<string, GuidedTourProgress>;
}

/**
 * Options for {@link GuidedTourApi.start}.
 *
 * @public
 */
export interface GuidedTourStartOptions {
  /** Ignore saved progress and start at the first step (or `stepId`). */
  force?: boolean;
  /** Start at this step instead of the first or the saved one. */
  stepId?: string;
}

/**
 * The guided tour API: the global tour registry, the runner and the
 * per-user progress store.
 *
 * @public
 */
export interface GuidedTourApi {
  /** All registered tours, ordered by `order` then title. */
  getTours(): GuidedTour[];
  /** A registered tour by id. */
  getTour(id: string): GuidedTour | undefined;

  /**
   * Starts a tour. Without `force`, a dismissed or completed tour of the
   * same version is not started and an in-progress tour resumes at its
   * saved step. Any running tour is replaced.
   */
  start(id: string, options?: GuidedTourStartOptions): void;
  /** Starts the first tour of the list and queues the rest. */
  startQueue(ids: string[], options?: { onboarding?: boolean }): void;
  /** Shows the next step; completes the tour on its last step. */
  next(): void;
  /** Shows the previous step; a no-op on the first step. */
  previous(): void;
  /** Closes the running tour and remembers it as dismissed. */
  dismiss(): void;
  /** Finishes the running tour and starts the next one in the queue. */
  complete(): void;

  /** Whether tours may start on their own (login and route triggers). */
  isAutoStartEnabled(): boolean;
  /** The current state; a new object on every change. */
  getSnapshot(): GuidedTourSnapshot;
  /** Calls the listener on every change; returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;

  /**
   * Returns the saved progress for a tour, or undefined when there is none
   * or it belongs to an older version of the tour.
   */
  getProgress(id: string): GuidedTourProgress | undefined;
  /** Clears the progress of one tour; stops it if it is running. */
  resetProgress(id: string): Promise<void>;
  /** Clears the progress of every tour and the onboarded flag; stops any running tour. */
  resetAllProgress(): Promise<void>;
  /** Marks the login sequence as handled for this user. */
  markOnboarded(): Promise<void>;
}

/**
 * API ref for the guided tour API. Resolve it with `useApiHolder()` when the
 * guided tour plugin may not be installed.
 *
 * @public
 */
export const guidedTourApiRef = createApiRef<GuidedTourApi>().with({
  id: 'plugin.guided-tours.api',
});

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
import { StorageApi } from '@backstage/frontend-plugin-api';
import {
  GuidedTour,
  GuidedTourApi,
  GuidedTourProgress,
  GuidedTourRunnerState,
  GuidedTourSnapshot,
  GuidedTourStartOptions,
} from '@backstage-community/plugin-guided-tours-react';
import { ProgressStore } from './progressStore';

const IDLE: GuidedTourRunnerState = { stepIndex: 0, queue: [] };

export function sortTours(tours: GuidedTour[]): GuidedTour[] {
  return [...tours].sort(
    (a, b) =>
      (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title),
  );
}

/** Progress is only valid for the tour version it was written for. */
export function effectiveProgress(
  tour: GuidedTour,
  progress: Record<string, GuidedTourProgress>,
): GuidedTourProgress | undefined {
  const saved = progress[tour.id];
  if (!saved || saved.version !== (tour.version ?? 1)) {
    return undefined;
  }
  return saved;
}

/**
 * Picks the login tours to play now. Before onboarding every login tour
 * without progress is queued; afterwards only tours that are new to the
 * user (no progress entry at all for the current version).
 */
export function selectLoginTours(options: {
  tours: GuidedTour[];
  progress: Record<string, GuidedTourProgress>;
  onboarded: boolean;
}): string[] {
  return sortTours(options.tours)
    .filter(t => t.autoStart === 'login')
    .filter(t => effectiveProgress(t, options.progress) === undefined)
    .map(t => t.id);
}

export class DefaultGuidedTourApi implements GuidedTourApi {
  private readonly tours: GuidedTour[];
  private readonly store: ProgressStore;
  private readonly autoStart: boolean;
  private readonly listeners = new Set<() => void>();
  private state: GuidedTourRunnerState = IDLE;
  private onboardingRun = false;
  private snapshot: GuidedTourSnapshot;

  constructor(options: {
    tours: GuidedTour[];
    storageApi: StorageApi;
    autoStart?: boolean;
  }) {
    this.tours = sortTours(options.tours);
    this.autoStart = options.autoStart ?? true;
    this.store = new ProgressStore({
      storage: options.storageApi,
      tourIds: this.tours.map(t => t.id),
    });
    this.snapshot = this.buildSnapshot();
    this.store.subscribe(() => this.emit());
  }

  getTours(): GuidedTour[] {
    return this.tours;
  }

  getTour(id: string): GuidedTour | undefined {
    return this.tours.find(t => t.id === id);
  }

  isAutoStartEnabled(): boolean {
    return this.autoStart;
  }

  getSnapshot = (): GuidedTourSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getProgress(id: string): GuidedTourProgress | undefined {
    const tour = this.getTour(id);
    return tour
      ? effectiveProgress(tour, this.store.getSnapshot().progress)
      : undefined;
  }

  start(id: string, options: GuidedTourStartOptions = {}): void {
    const tour = this.getTour(id);
    if (!tour || tour.steps.length === 0) {
      return;
    }
    const saved = this.getProgress(id);
    let stepIndex = 0;
    if (options.stepId) {
      stepIndex = Math.max(
        0,
        tour.steps.findIndex(s => s.id === options.stepId),
      );
    } else if (!options.force && saved) {
      if (saved.status !== 'in-progress') {
        return;
      }
      stepIndex = Math.min(saved.stepIndex, tour.steps.length - 1);
    }
    if (this.state.activeTourId && this.state.activeTourId !== id) {
      this.save(this.state.activeTourId, 'in-progress', this.state.stepIndex);
    }
    this.onboardingRun = false;
    this.setState({ activeTourId: id, stepIndex, queue: [] });
    this.save(id, 'in-progress', stepIndex);
  }

  startQueue(ids: string[], options: { onboarding?: boolean } = {}): void {
    const [first, ...rest] = ids.filter(id => this.getTour(id));
    if (!first) {
      if (options.onboarding) {
        this.markOnboarded();
      }
      return;
    }
    this.start(first, { force: true });
    this.onboardingRun = !!options.onboarding;
    this.setState({ ...this.state, queue: rest });
  }

  next(): void {
    const tour = this.activeTour();
    if (!tour) return;
    if (this.state.stepIndex >= tour.steps.length - 1) {
      this.complete();
      return;
    }
    const stepIndex = this.state.stepIndex + 1;
    this.setState({ ...this.state, stepIndex });
    this.save(tour.id, 'in-progress', stepIndex);
  }

  previous(): void {
    const tour = this.activeTour();
    if (!tour || this.state.stepIndex === 0) return;
    const stepIndex = this.state.stepIndex - 1;
    this.setState({ ...this.state, stepIndex });
    this.save(tour.id, 'in-progress', stepIndex);
  }

  dismiss(): void {
    const tour = this.activeTour();
    if (!tour) return;
    this.save(tour.id, 'dismissed', this.state.stepIndex);
    // Dismissing ends the whole sequence, not just the current tour.
    this.finishRun();
  }

  complete(): void {
    const tour = this.activeTour();
    if (!tour) return;
    this.save(tour.id, 'completed', tour.steps.length - 1);
    const [nextId, ...queue] = this.state.queue;
    if (nextId) {
      const onboarding = this.onboardingRun;
      // leave the finished tour before starting the next one, otherwise
      // start() would save it as in-progress again
      this.state = IDLE;
      this.start(nextId, { force: true });
      this.onboardingRun = onboarding;
      this.setState({ ...this.state, queue });
      return;
    }
    this.finishRun();
  }

  async resetProgress(id: string): Promise<void> {
    if (this.state.activeTourId === id) {
      this.setState(IDLE);
    }
    await this.store.clearProgress(id);
  }

  async resetAllProgress(): Promise<void> {
    this.setState(IDLE);
    await this.store.clearAll();
  }

  markOnboarded(): Promise<void> {
    return this.store.setOnboarded(true);
  }

  private finishRun() {
    const onboarding = this.onboardingRun;
    this.onboardingRun = false;
    this.setState(IDLE);
    if (onboarding) {
      this.markOnboarded();
    }
  }

  private activeTour(): GuidedTour | undefined {
    return this.state.activeTourId
      ? this.getTour(this.state.activeTourId)
      : undefined;
  }

  private save(
    id: string,
    status: GuidedTourProgress['status'],
    stepIndex: number,
  ) {
    const tour = this.getTour(id);
    this.store.setProgress(id, {
      status,
      stepIndex,
      version: tour?.version ?? 1,
      updatedAt: new Date().toISOString(),
    });
  }

  private setState(state: GuidedTourRunnerState) {
    this.state = state;
    this.emit();
  }

  private buildSnapshot(): GuidedTourSnapshot {
    const { ready, onboarded, progress } = this.store.getSnapshot();
    return { ready, onboarded, progress, state: this.state };
  }

  private emit() {
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach(l => l());
  }
}

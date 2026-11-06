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
import {
  StorageApi,
  StorageValueSnapshot,
} from '@backstage/frontend-plugin-api';
import { JsonValue } from '@backstage/types';
import { GuidedTourProgress } from '@backstage-community/plugin-guided-tours-react';

export const PROGRESS_BUCKET = 'guided-tours';
export const ONBOARDED_KEY = 'onboarded';
export const tourKey = (id: string) => `tour/${id}`;

export interface ProgressStoreSnapshot {
  ready: boolean;
  onboarded: boolean;
  progress: Record<string, GuidedTourProgress>;
}

/**
 * Per-user progress on top of a StorageApi bucket: one key per tour plus an
 * `onboarded` flag. Writes to the same key are serialized.
 */
export class ProgressStore {
  private readonly storage: StorageApi;
  private readonly tourIds: string[];
  private readonly listeners = new Set<() => void>();
  private readonly pending = new Map<string, Promise<void>>();
  /** Number of our own writes in flight per key. */
  private readonly inflight = new Map<string, number>();
  private readonly loaded = new Set<string>();
  private readonly subscriptions: Array<{ unsubscribe(): void }> = [];
  private snapshot: ProgressStoreSnapshot = {
    ready: false,
    onboarded: false,
    progress: {},
  };

  constructor(options: { storage: StorageApi; tourIds: string[] }) {
    this.storage = options.storage.forBucket(PROGRESS_BUCKET);
    this.tourIds = options.tourIds;
    this.observe(ONBOARDED_KEY, s => {
      this.snapshot = { ...this.snapshot, onboarded: s.value === true };
    });
    for (const id of this.tourIds) {
      this.observe(tourKey(id), s => {
        const progress = { ...this.snapshot.progress };
        if (s.presence === 'present' && isProgress(s.value)) {
          progress[id] = s.value;
        } else {
          delete progress[id];
        }
        this.snapshot = { ...this.snapshot, progress };
      });
    }
    if (this.tourIds.length === 0) {
      // nothing but the onboarded key to wait for
    }
  }

  getSnapshot(): ProgressStoreSnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.listeners.clear();
  }

  async setProgress(id: string, progress: GuidedTourProgress): Promise<void> {
    // optimistic local update so the UI never waits for the backend
    this.snapshot = {
      ...this.snapshot,
      progress: { ...this.snapshot.progress, [id]: progress },
    };
    this.emit();
    await this.write(tourKey(id), () =>
      this.storage.set(tourKey(id), progress as unknown as JsonValue),
    );
  }

  async clearProgress(id: string): Promise<void> {
    const progress = { ...this.snapshot.progress };
    delete progress[id];
    this.snapshot = { ...this.snapshot, progress };
    this.emit();
    await this.write(tourKey(id), () => this.storage.remove(tourKey(id)));
  }

  async setOnboarded(value: boolean): Promise<void> {
    this.snapshot = { ...this.snapshot, onboarded: value };
    this.emit();
    await this.write(ONBOARDED_KEY, () =>
      value
        ? this.storage.set(ONBOARDED_KEY, true)
        : this.storage.remove(ONBOARDED_KEY),
    );
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      ...this.tourIds.map(id => this.clearProgress(id)),
      this.setOnboarded(false),
    ]);
  }

  private observe(
    key: string,
    apply: (snapshot: StorageValueSnapshot<JsonValue>) => void,
  ) {
    const handle = (s: StorageValueSnapshot<JsonValue>) => {
      if (s.presence === 'unknown') {
        return;
      }
      // While our own writes are pending, the storage echoes older values
      // (e.g. the "dismissed" written just before a reset). The optimistic
      // local state is the truth until the queue has drained.
      if ((this.inflight.get(key) ?? 0) > 0) {
        return;
      }
      apply(s);
      this.loaded.add(key);
      const ready = this.loaded.size >= this.tourIds.length + 1;
      if (ready !== this.snapshot.ready) {
        this.snapshot = { ...this.snapshot, ready };
      }
      this.emit();
    };
    handle(this.storage.snapshot<JsonValue>(key));
    this.subscriptions.push(
      this.storage.observe$<JsonValue>(key).subscribe({ next: handle }),
    );
  }

  private write(key: string, op: () => Promise<void>): Promise<void> {
    this.inflight.set(key, (this.inflight.get(key) ?? 0) + 1);
    const previous = this.pending.get(key) ?? Promise.resolve();
    const next = previous
      .then(op, op)
      .catch(() => undefined)
      .finally(() => {
        this.inflight.set(key, (this.inflight.get(key) ?? 1) - 1);
      });
    this.pending.set(key, next);
    return next;
  }

  private emit() {
    this.listeners.forEach(l => l());
  }
}

function isProgress(value: JsonValue): value is GuidedTourProgress & JsonValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as any).status === 'string' &&
    typeof (value as any).stepIndex === 'number'
  );
}

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

import ZenObservable from 'zen-observable';

import {
  ErrorApi,
  FeatureFlag,
  FeatureFlagsApi,
  StorageApi,
  StorageValueSnapshot,
} from '@backstage/frontend-plugin-api';
import { FeatureFlagState } from '@backstage/core-plugin-api';
import type { Observable } from '@backstage/types';

import { PersistedFeatureFlagsApi } from './PersistedFeatureFlagsApi';

export interface DefaultPersistedFeatureFlagsApiOptions {
  errorApi: ErrorApi;
  featureFlagsApi: FeatureFlagsApi;
  storageApi: StorageApi;
  flags: FeatureFlag[];
  strictMode: boolean;
}

export class DefaultPersistedFeatureFlagsApi
  implements PersistedFeatureFlagsApi
{
  private readonly errorApi: ErrorApi;
  private readonly featureFlagsApi: FeatureFlagsApi;
  private readonly storageApi: StorageApi;
  private readonly strictMode: boolean;
  private readonly signalledFlags = new Set<string>();

  // This holds _persisted_ flags only
  private readonly flags: Map<string, FeatureFlag>;

  constructor(options: DefaultPersistedFeatureFlagsApiOptions) {
    this.flags = new Map(options.flags.map(flag => [flag.name, flag]));
    this.errorApi = options.errorApi;
    this.featureFlagsApi = options.featureFlagsApi;
    this.storageApi = options.storageApi.forBucket('persisted-feature-flags');
    this.strictMode = options.strictMode;
  }

  #hasLocalFlag(flagName: string): boolean {
    return this.featureFlagsApi
      .getRegisteredFlags()
      .some(flag => flag.name === flagName);
  }

  #signalNotRegistered(flagName: string): void {
    if (this.strictMode && !this.signalledFlags.has(flagName)) {
      this.errorApi.post(new Error(`Feature flag not registered: ${flagName}`));
      this.signalledFlags.add(flagName);
    }
  }

  #fallback<T>(flagName: string, value: T): T {
    this.#signalNotRegistered(flagName);
    return value;
  }

  getPersistedFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getAllFlags(): FeatureFlag[] {
    const map = new Map(
      [
        ...this.getPersistedFlags(),
        ...this.featureFlagsApi.getRegisteredFlags(),
      ].map(flag => [flag.name, flag]),
    );
    return Array.from(map.values());
  }

  async isPersistedActive(flagName: string): Promise<boolean> {
    if (!this.flags.has(flagName)) {
      return this.#fallback(flagName, false);
    }

    const observable = this.observePersisted$(flagName);

    return new Promise<boolean>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: snapshot => {
          resolve(!!snapshot.value);
          subscription.unsubscribe();
        },
        error: err => {
          reject(err);
        },
      });
    });
  }

  async isActive(flagName: string): Promise<boolean> {
    if (this.flags.has(flagName)) {
      return this.isPersistedActive(flagName);
    }

    if (!this.#hasLocalFlag(flagName)) {
      return this.#fallback(flagName, false);
    }

    return this.featureFlagsApi.isActive(flagName);
  }

  observePersisted$(
    flagName: string,
  ): Observable<StorageValueSnapshot<boolean>> {
    if (!this.flags.has(flagName)) {
      this.#signalNotRegistered(flagName);
    }

    const storageApi = this.storageApi;

    return storageApi.observe$<boolean>(flagName);
  }

  observe$(flagName: string): Observable<StorageValueSnapshot<boolean>> {
    if (this.flags.has(flagName)) {
      return this.observePersisted$(flagName);
    }

    return new ZenObservable(subscriber => {
      if (!this.#hasLocalFlag(flagName)) {
        this.#signalNotRegistered(flagName);
        subscriber.next({
          key: flagName,
          presence: 'absent',
        });
        subscriber.complete();
        return;
      }
      const isActive = this.featureFlagsApi.isActive(flagName);
      subscriber.next({
        key: flagName,
        value: isActive,
        presence: 'present',
      });
      subscriber.complete();
    });
  }

  async setPersisted(flagName: string, value: boolean): Promise<void> {
    if (!this.flags.has(flagName)) {
      this.#signalNotRegistered(flagName);
    }
    return this.storageApi.set(flagName, value);
  }

  async set(flagName: string, value: boolean): Promise<void> {
    if (this.flags.has(flagName)) {
      return this.setPersisted(flagName, value);
    }

    if (!this.#hasLocalFlag(flagName)) {
      this.#signalNotRegistered(flagName);
    }

    return this.featureFlagsApi.save({
      states: {
        [flagName]: value ? FeatureFlagState.Active : FeatureFlagState.None,
      },
      merge: true,
    });
  }
}

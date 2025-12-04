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

import {
  FeatureFlag,
  StorageValueSnapshot,
} from '@backstage/frontend-plugin-api';
import type { Observable } from '@backstage/types';

/**
 * API for persisted feature flags.
 *
 * @public
 */
export interface PersistedFeatureFlagsApi {
  /**
   * Get the list of registered persisted feature flags.
   */
  getPersistedFlags(): FeatureFlag[];

  /**
   * Get the list of all registered feature flags, local (FeatureFlagApi and
   * persisted).
   */
  getAllFlags(): FeatureFlag[];

  /**
   * Get the active (current) value of a persisted feature flag.
   */
  isPersistedActive(flagName: string): Promise<boolean>;

  /**
   * Get the active (current) value of a feature flag (persisted if registered,
   * otherwise local).
   */
  isActive(flagName: string): Promise<boolean>;

  /**
   * Observe the state of a persisted feature flags.
   */
  observePersisted$(
    flagName: string,
  ): Observable<StorageValueSnapshot<boolean>>;

  /**
   * Observe the state of a feature flag (persisted if registered, otherwise
   * local).
   */
  observe$(flagName: string): Observable<StorageValueSnapshot<boolean>>;

  /**
   * Set a new value for a persisted feature flag.
   */
  setPersisted(flagName: string, value: boolean): Promise<void>;

  /**
   * Set a new value for a feature flag (persisted if registered, otherwise
   * local).
   */
  set(flagName: string, value: boolean): Promise<void>;
}

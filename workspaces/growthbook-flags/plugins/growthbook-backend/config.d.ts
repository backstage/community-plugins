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
export interface Config {
  growthbook?: {
    /**
     * Base URL of your GrowthBook instance.
     * @example https://app.growthbook.io
     * @visibility backend
     */
    baseUrl: string;

    /**
     * GrowthBook Management API secret key (read-only).
     * When present, flags are fetched via the Management API with full project and environment metadata.
     * When absent, the SDK API fallback is used and sdkKeys must be provided.
     * @visibility secret
     */
    secretKey?: string;

    /**
     * GrowthBook SDK connection keys, keyed by environment name.
     * Used as a fallback when secretKey is not configured.
     * Add one entry per environment you want to support.
     * @example { prod: 'sdk-abc123', staging: 'sdk-def456', dev: 'sdk-ghi789' }
     * @visibility backend
     */
    sdkKeys: {
      [key: string]: string;
    };
  };
}

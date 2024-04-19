/*
 * Copyright 2022 The Backstage Authors
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
import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

/** Configuration for the Vault plugin */
export interface Config {
  vault?: {
    /**
     * The baseUrl for your Vault instance.
     * @visibility frontend
     */
    baseUrl: string;

    /**
     * The publicUrl for your Vault instance (Optional).
     * @visibility frontend
     */
    publicUrl?: string;

    /**
     * The token used by Backstage to access Vault.
     * @visibility secret
     */
    token: string;

    /**
     * The secret engine name where in vault. Defaults to `secrets`.
     */
    secretEngine?: string;

    /**
     * The version of the K/V API. Defaults to `2`.
     */
    kvVersion?: 1 | 2;

    /**
     * If set to true, the default schedule (hourly) will be used. If a
     * different schedule is set, this will be used instead.
     * */
    schedule?: TaskScheduleDefinitionConfig | boolean;
  };
}

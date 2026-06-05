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
import { createExtensionPoint } from '@backstage/backend-plugin-api';
import { SearchEngine } from '@backstage/plugin-search-backend-node';

/**
 * Registry interface for sub-engines to hook into the Hybrid Search Router.
 *
 * @public
 */
export interface HybridSearchEngineRegistry {
  registerEngine(
    name: string,
    engine: SearchEngine,
    options: { supportsTypes: string[] },
  ): void;
}

/**
 * Extension point for registering backend search engines into the Hybrid Search Router.
 *
 * @public
 */
export const hybridSearchEngineRegistryExtensionPoint =
  createExtensionPoint<HybridSearchEngineRegistry>({
    id: 'search.hybrid-registry',
  });

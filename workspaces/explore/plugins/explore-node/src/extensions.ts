/*
 * Copyright 2024 The Backstage Authors
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
import type { ExploreToolProvider } from './types';

/**
 * @public
 */
export interface ToolProviderExtensionPoint {
  setToolProvider(provider: ExploreToolProvider): void;
}

/**
 * Extension point which allows to set the ToolProvider to be used, which will serve as source of tools
 * @public
 */
export const toolProviderExtensionPoint =
  createExtensionPoint<ToolProviderExtensionPoint>({
    id: 'explore.tool-provider',
  });

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

import { PluginIdProvider, RBACProvider } from './types';

/**
 * An extension point the exposes the ability to configure additional PluginIDProviders.
 *
 * @public
 */
export const pluginIdProviderExtensionPoint =
  createExtensionPoint<PluginIdProviderExtensionPoint>({
    id: 'permission.rbac.pluginIdProvider',
  });

/**
 * The interface for {@link pluginIdProviderExtensionPoint}.
 *
 * @public
 */
export type PluginIdProviderExtensionPoint = {
  addPluginIdProvider(pluginIdProvider: PluginIdProvider): void;
};

export const rbacProviderExtensionPoint =
  createExtensionPoint<RBACProviderExtensionPoint>({
    id: 'permission.rbac.rbacProvider',
  });

export type RBACProviderExtensionPoint = {
  addRBACProvider(
    ...providers: Array<RBACProvider | Array<RBACProvider>>
  ): void;
};

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

/**
 * Used to provide a list of pluginIDs on which a permission well-known endpoint is to be searched.
 * @public
 */
export interface PluginIdProvider {
  getPluginIds: () => string[];
}

/**
 * @public
 */
export interface RBACProvider {
  getProviderName(): string;
  connect(connection: RBACProviderConnection): Promise<void>;
  refresh(): Promise<void>;
}

/**
 * @public
 */
export interface RBACProviderConnection {
  applyRoles(roles: string[][]): Promise<void>;
  applyPermissions(permissions: string[][]): Promise<void>;
}

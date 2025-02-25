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
import type { ComponentType, ReactNode } from 'react';

/** @public */
export type ManageProvider = ComponentType<{
  children?: ReactNode | undefined;
}>;

/** @public */
export interface ManageApi {
  /**
   * The order of kinds to show for e.g. tabs.
   *
   * Kinds not part of this list will appear afterwards.
   */
  readonly kindOrder: string[];

  /**
   * Get the list of registered Providers for the manage page
   */
  getProviders(): Iterable<ManageProvider>;
}

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

import type { Entity } from '@backstage/catalog-model';

/** @public */
export type ManageProvider = ComponentType<{
  children?: ReactNode | undefined;
}>;

/**
 * This type contains the owned groups and all owner entity refs.
 *
 * @public
 */
export interface Owners {
  groups: Entity[];
  ownedEntityRefs: string[];
}

/**
 * This type contains owners and all owned entities
 *
 * @public
 */
export interface OwnersAndEntities {
  ownedEntities: Entity[];
  owners: Owners;
}

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

  /**
   * Get owner entities and owned entities
   */
  getOwnersAndEntities(kinds?: readonly string[]): Promise<OwnersAndEntities>;
}

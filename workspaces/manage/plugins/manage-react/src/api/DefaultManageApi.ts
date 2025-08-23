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
import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';

import type { OwnersAndOwnedEntities } from '@backstage-community/plugin-manage-common';

import type {
  ManageApi,
  ManageProvider,
  Owners,
  OwnersAndEntities,
} from './ManageApi';
import type { ManageModuleApi } from './types';
import { orderOwnership } from './order-ownership';
import { orderEntities } from './order-entities';

/** @public */
export interface DefaultManageApiOptions {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;

  /**
   * The kind order to use when rendering the owned entities.
   */
  kindOrder?: string[];

  /**
   * Manage providers to include. These will be mounted top-level, so that any
   * component in the Manage page can access them
   */
  providers: Iterable<ManageModuleApi>;
}

/**
 * Default implementation of the ManageApi.
 *
 * @public
 */
export class DefaultManageApi implements ManageApi {
  public readonly kindOrder: string[];
  readonly #discoveryApi: DiscoveryApi;
  readonly #fetchApi: FetchApi;

  readonly #providers: ManageProvider[] = [];

  public constructor({
    discoveryApi,
    fetchApi,
    kindOrder,
    providers,
  }: DefaultManageApiOptions) {
    this.#discoveryApi = discoveryApi;
    this.#fetchApi = fetchApi;

    this.kindOrder = kindOrder ?? [];

    this.#providers = Array.from(providers)
      .map(provider => provider.getProvider?.())
      .filter((v): v is NonNullable<typeof v> => !!v);
  }

  getProviders = (): readonly ManageProvider[] => {
    return this.#providers;
  };

  getOwnersAndEntities = async (
    kinds: readonly string[],
  ): Promise<OwnersAndEntities> => {
    const manageBaseUrl = await this.#discoveryApi.getBaseUrl('manage');
    const url = new URL(`${manageBaseUrl}/home`);
    for (const kind of kinds) {
      url.searchParams.append('kind', kind);
    }
    const resp = await this.#fetchApi.fetch(url);
    const data: OwnersAndOwnedEntities = await resp.json();

    const ancestry = orderOwnership(data.ownerEntities);

    const owners: Owners = {
      groups: ancestry.filter(entity => entity.kind === 'Group'),
      ownedEntityRefs: ancestry.map(entity => stringifyEntityRef(entity)),
    };

    return {
      ownedEntities: orderEntities(
        data.ownedEntities,
        kinds,
        owners.ownedEntityRefs,
      ),
      owners,
    };
  };
}

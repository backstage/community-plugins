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
import type { ManageApi, ManageProvider } from './ManageApi';
import { ManageModuleApi } from './types';

/** @public */
export interface DefaultManageApiOptions {
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
  readonly #providers: ManageProvider[] = [];

  public constructor({ kindOrder, providers }: DefaultManageApiOptions) {
    this.kindOrder = kindOrder ?? [];

    this.#providers = Array.from(providers)
      .map(provider => provider.getProvider?.())
      .filter((v): v is NonNullable<typeof v> => !!v);
  }

  getProviders = (): readonly ManageProvider[] => {
    return this.#providers;
  };
}

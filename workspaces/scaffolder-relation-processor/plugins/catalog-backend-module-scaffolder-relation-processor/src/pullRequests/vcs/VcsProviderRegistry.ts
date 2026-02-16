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

import type { Entity } from '@backstage/catalog-model';
import type { VcsProvider } from './VcsProvider';

/**
 * Registry for managing multiple VCS providers
 *
 * @public
 */
export class VcsProviderRegistry {
  private providers: VcsProvider[] = [];

  /**
   * Registers a VCS provider
   *
   * @param provider - The provider to register
   */
  registerProvider(provider: VcsProvider): void {
    this.providers.push(provider);
  }

  /**
   * Gets a provider that can handle the given URL
   *
   * @param url - Repository URL
   * @returns VCS provider that can handle the URL, or null if none found
   */
  getProviderForUrl(url: string): VcsProvider | null {
    return this.providers.find(p => p.canHandle(url)) ?? null;
  }

  /**
   * Gets a provider that can extract a repo URL from the given entity
   *
   * @param entity - Backstage entity
   * @returns VCS provider that can handle the entity, or null if none found
   */
  getProviderForEntity(entity: Entity): VcsProvider | null {
    for (const provider of this.providers) {
      const url = provider.extractRepoUrl(entity);
      if (url) {
        return provider;
      }
    }
    return null;
  }

  /**
   * Gets all registered providers
   *
   * @returns Array of all registered providers
   */
  getProviders(): VcsProvider[] {
    return [...this.providers];
  }
}

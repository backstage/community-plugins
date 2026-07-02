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

import { VcsProvider } from '@backstage-community/plugin-techdocs-editor-node';

/**
 * Registry of VcsProvider implementations.
 * Populated via the VcsProviderExtensionPoint.
 * @internal
 */
export class VcsProviderRegistry {
  private readonly providers: VcsProvider[] = [];

  register(provider: VcsProvider): void {
    this.providers.push(provider);
  }

  /** Returns the first provider that can handle the given repo URL, or undefined. */
  getForUrl(repoUrl: string): VcsProvider | undefined {
    return this.providers.find(p => p.canHandle(repoUrl));
  }

  all(): VcsProvider[] {
    return [...this.providers];
  }
}

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

import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { techdocsEditorVcsProviderExtensionPoint } from '@backstage-community/plugin-techdocs-editor-node';
import { GitHubVcsProvider } from './providers/GitHubVcsProvider';
import { GitLabVcsProvider } from './providers/GitLabVcsProvider';
import { LocalFsVcsProvider } from './service/LocalFsVcsProvider';

/**
 * Backend module that registers the built-in GitHub, GitLab, and local
 * filesystem VCS providers for the techdocs-editor backend plugin.
 *
 * Add this to your backend to enable PR creation for GitHub and GitLab,
 * and direct file editing for local documentation sources:
 *
 * ```ts
 * backend.add(import('@backstage-community/plugin-techdocs-editor-backend'));
 * ```
 *
 * @public
 */
export const techdocsEditorModuleDefaultProviders = createBackendModule({
  pluginId: 'techdocs-editor',
  moduleId: 'default-providers',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        vcs: techdocsEditorVcsProviderExtensionPoint,
      },
      async init({ config, vcs }) {
        // Register VCS providers in priority order (first match wins)
        // GitHub and GitLab have higher priority than local filesystem
        vcs.addProvider(new GitHubVcsProvider(config));
        vcs.addProvider(new GitLabVcsProvider(config));
        // Local filesystem provider handles file:// URLs (lowest priority)
        vcs.addProvider(new LocalFsVcsProvider());
      },
    });
  },
});

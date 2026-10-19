/*
 * Copyright 2026 The Backstage Authors
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
  createFrontendModule,
  PageBlueprint,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';

/**
 * Example of how a consuming app can override where the `copilot` plugin's
 * individual ("my Copilot metrics") sub-page is mounted.
 *
 * By default, the `copilot` plugin mounts this sub-page at `/copilot/me`,
 * as a tab of the main Copilot Insights page. This module demonstrates
 * re-attaching the very same extension (matched by the shared plugin ID and
 * extension name, `sub-page:copilot/me`) to the Settings page instead, so
 * that it shows up as a "Copilot Metrics" tab alongside "General",
 * "Feature Flags", etc.
 *
 * To use this in your own app, install this module (or a module of your
 * own modeled on it) instead of relying on the plugin's default page
 * placement — see `packages/app/src/App.tsx`.
 */
export const copilotMeOverrideModule = createFrontendModule({
  pluginId: 'copilot',
  extensions: [
    SubPageBlueprint.make({
      name: 'me',
      attachTo: { id: 'page:user-settings', input: 'pages' },
      params: {
        path: 'copilot-me',
        title: 'My Copilot Metrics',
        loader: () =>
          import('@backstage-community/plugin-copilot').then(m => (
            <m.MyMetricsContent />
          )),
      },
    }),
    PageBlueprint.make({
      name: 'me',
      params: {
        path: 'copilot-me',
        title: 'My Copilot Metrics',
        loader: () =>
          import('@backstage-community/plugin-copilot').then(m => (
            <m.MyMetricsContent />
          )),
      },
    }),
  ],
});

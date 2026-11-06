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
  PluginHeaderActionBlueprint,
} from '@backstage/frontend-plugin-api';
import { RestartTourAction } from '@backstage-community/plugin-guided-tours-react';

/**
 * Puts the "restart the guided tour" button of the react library into the
 * plugin header of the pages that have a tour of their own.
 */
const restartTourModule = (pluginId: string, tourId: string) =>
  createFrontendModule({
    pluginId,
    extensions: [
      PluginHeaderActionBlueprint.make({
        name: 'restart-guided-tour',
        params: {
          loader: async () => <RestartTourAction tourId={tourId} />,
        },
      }),
    ],
  });

export const headerActionModules = [
  restartTourModule('catalog', 'guided-tours/catalog'),
  restartTourModule('scaffolder', 'guided-tours/scaffolder'),
  restartTourModule('notifications', 'guided-tours/notifications'),
  restartTourModule('user-settings', 'guided-tours/settings'),
];

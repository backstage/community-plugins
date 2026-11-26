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
import { createDevApp } from '@backstage/frontend-dev-utils';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { MarkdownText } from '@backstage-community/plugin-guided-tours-react';
import plugin from '../src';
import {
  catalogMockModule,
  notificationsMockModule,
  scaffolderMockModule,
} from './mockApis';
import { headerActionModules } from './headerActions';
import { devTours } from './tours';
import { devTranslationsModule } from './translations';
import { guidedToursTranslationsModule } from '../src/alpha';

const demoModule = createFrontendModule({
  pluginId: 'guided-tours',
  extensions: [...devTours],
});

const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [
    HomePageWidgetBlueprint.make({
      name: 'welcome',
      params: {
        name: 'GuidedTourWelcome',
        title: 'Guided tour demo',
        description: 'Where to find things in this dev app',
        components: async () => ({
          Content: () => (
            <MarkdownText
              content={
                'This home page is part of the guided tour dev app. ' +
                'Start or replay any tour from [Guided tours](/guided-tours).'
              }
            />
          ),
        }),
      },
    }),
  ],
});

createDevApp({
  features: [
    plugin,
    demoModule,
    homePlugin,
    homeModule,
    catalogPlugin,
    catalogMockModule,
    scaffolderPlugin,
    scaffolderMockModule,
    notificationsPlugin,
    notificationsMockModule,
    userSettingsPlugin,
    // the plugin's and the dev app's translations, see app-config.yaml for
    // the languages offered in the settings
    guidedToursTranslationsModule,
    devTranslationsModule,
    // "restart the guided tour" header buttons on catalog, create,
    // notifications and settings
    ...headerActionModules,
  ],
});

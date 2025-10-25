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
import { createApp } from '@backstage/frontend-defaults';
import { navModule } from './modules/nav';
import { SignInPage } from '@backstage/core-components';
import {
  createFrontendModule,
  SignInPageBlueprint,
} from '@backstage/frontend-plugin-api';
import { homeModule } from './modules/home';
import SignalsDisplay from '@backstage/plugin-signals/alpha';
import announcementsPlugin from '@backstage-community/plugin-announcements/alpha';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import searchApi from '@backstage/plugin-search/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import visualizerPlugin from '@backstage/plugin-app-visualizer';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      <SignInPage {...props} providers={['guest']} />,
  },
});

export default createApp({
  features: [
    catalogPlugin,
    homeModule,
    navModule,
    notificationsPlugin,
    searchApi,
    SignalsDisplay,
    userSettingsPlugin,
    visualizerPlugin,
    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPage],
    }),
    announcementsPlugin,
  ],
});

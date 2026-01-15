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
  SettingsLayout,
  UserSettingsGeneral,
  UserSettingsAuthProviders,
} from '@backstage/plugin-user-settings';

import { UserSettingsFeatureFlags } from '@backstage-community/plugin-persisted-feature-flags';
import { UserNotificationSettingsCard } from '@backstage/plugin-notifications';

export const customSettingsPage = (
  <SettingsLayout>
    <SettingsLayout.Route path="general" title="General">
      <UserSettingsGeneral />
    </SettingsLayout.Route>
    <SettingsLayout.Route
      path="auth-providers"
      title="Authentication providers"
    >
      <UserSettingsAuthProviders />
    </SettingsLayout.Route>
    <SettingsLayout.Route path="feature-flags" title="Feature Flags">
      <UserSettingsFeatureFlags />
    </SettingsLayout.Route>
    <SettingsLayout.Route path="/notifications" title="Notifications">
      <UserNotificationSettingsCard
        originNames={{ 'plugin:scaffolder': 'Scaffolder' }}
      />
    </SettingsLayout.Route>
  </SettingsLayout>
);

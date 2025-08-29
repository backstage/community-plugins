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

import { useMemo } from 'react';

import { useUserSettings } from '@backstage-community/plugin-manage-react';

export function usePrimeUserSettings(userSettings: [string, string][]): void {
  // The initial set of user settings shouldn't change, but if they would, the
  // changes will be ignored.
  // This way, it's possible to iterate over the initial array and prime (and
  // keep listening to changes) for the initial settings using hooks in a loop.
  // After all, this is just an optimization to have settings pre-fetched when
  // child components of the Manage page are rendered.
  const userSettingsOnce = useMemo(
    () => userSettings,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  for (const userSetting of userSettingsOnce) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useUserSettings(userSetting[0], userSetting[1]);
  }
}

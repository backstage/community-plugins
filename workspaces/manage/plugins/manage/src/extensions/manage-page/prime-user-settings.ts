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
  ManageDynamicConfig,
  ManageStaticConfig,
} from '@backstage-community/plugin-manage-react';

import type { ContentWidgetSpec } from '../../components/ManagePage/types';

// Get the accordion keys for the possible views
function getAccordionKeys(
  key: string,
  uniquePerKind: boolean,
  kinds: string[],
): string[] {
  if (!uniquePerKind) {
    return [`$manage-${key}-$kind`];
  }

  return [
    `$manage-${key}-$starred`,
    `$manage-${key}-$combined`,
    ...kinds.map(kind => `$manage-${key}-${kind}`),
  ];
}

/**
 * Get the list of user settings to pre-fetch on page load for faster lookup
 * values of components in the rest of the Manage page
 */
export function getPrimeUserSettings(
  contentWidgets: ContentWidgetSpec[],
  staticConfig: ManageStaticConfig,
  dynamicConfig: ManageDynamicConfig,
): [string, string][] {
  // Extract user setting keys for the accordions, for pre-fetching on
  // page load
  const accordionUserSettingKeys = contentWidgets
    .map(widget =>
      getAccordionKeys(
        'manage-accordion',
        widget.accordion.perKind,
        staticConfig.kinds,
      ).map(feature => [widget.accordion.key, feature] as [string, string]),
    )
    .flat(1);

  const primeUserSettings = [
    ...accordionUserSettingKeys,
    ...dynamicConfig.primeUserSettings,
  ];

  return primeUserSettings;
}

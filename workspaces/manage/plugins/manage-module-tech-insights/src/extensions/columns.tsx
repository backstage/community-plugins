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

import { ManageEntityColumnBlueprint } from '@backstage-community/plugin-manage-react';

export const manageTechInsightsColumns =
  ManageEntityColumnBlueprint.makeWithOverrides({
    name: 'checks',
    factory(originalFactory) {
      return originalFactory(defineParams =>
        defineParams({
          attachTo: [{ tab: 'component', multi: false }, 'system', '$entities'],
          loaderSingle: async () =>
            import('../columns/columns-single').then(m =>
              // checkFilter and showEmpty as are derived from the config blueprint
              // The undefined here (the internal API in general) is to be
              // simplified once support for the old frontend system is removed.
              m.makeGetColumn(undefined, undefined as any as boolean),
            ),
          loaderMulti: async () =>
            import('../columns/columns-multiple').then(m =>
              // checkFilter and showEmpty as are derived from the config blueprint
              // The undefined here (the internal API in general) is to be
              // simplified once support for the old frontend system is removed.
              m.makeGetColumns(undefined, undefined as any as boolean),
            ),
        }),
      );
    },
  });

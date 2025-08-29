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

import { createExtensionInput } from '@backstage/frontend-plugin-api';

import { ManageProviderBlueprint } from '@backstage-community/plugin-manage-react';

import { manageTechInsightsConfigDataRef } from './blueprints/data-refs';

export const manageTechInsightsProvider =
  ManageProviderBlueprint.makeWithOverrides({
    name: 'provider',
    inputs: {
      config: createExtensionInput([
        manageTechInsightsConfigDataRef.optional(),
      ]),
    },
    factory(defineFactory, { inputs }) {
      const {
        checkFilter,
        columnsCheckFilter,
        getPercentColor,
        mapTitle,
        showEmpty,
      } = inputs.config.reduce(
        (prev, cur) => ({
          ...prev,
          ...cur.get(manageTechInsightsConfigDataRef),
        }),
        {} as typeof manageTechInsightsConfigDataRef.T,
      );

      return defineFactory(defineParams =>
        defineParams({
          loader: async () =>
            import('../components/ManageProvider').then(
              m => m.ManageProviderTechInsights,
            ),
          props: {
            checkFilter,
            columnsCheckFilter,
            getPercentColor,
            mapTitle,
            showEmpty,
          },
        }),
      );
    },
  });

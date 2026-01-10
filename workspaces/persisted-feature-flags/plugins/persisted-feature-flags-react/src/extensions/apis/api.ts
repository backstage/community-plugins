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

import { ConflictError } from '@backstage/errors';
import {
  ApiBlueprint,
  createExtensionDataRef,
  createExtensionInput,
  errorApiRef,
  FeatureFlag,
  featureFlagsApiRef,
  storageApiRef,
} from '@backstage/frontend-plugin-api';

import { persistedFeatureFlagsApiRef } from '../../apis';
import { DefaultPersistedFeatureFlagsApi } from '../../apis/PersistedFeatureFlagsApi/DefaultPersistedFeatureFlagsApi';
import { FeatureFlagInfo } from '../../types';

export const flagDataRef = createExtensionDataRef<FeatureFlagInfo[]>().with({
  id: 'flag-infos',
});

/** @public */
export const apiExtension = ApiBlueprint.makeWithOverrides({
  inputs: {
    flag: createExtensionInput([flagDataRef]),
  },
  config: {
    schema: {
      strict: z => z.boolean().optional(),
    },
  },
  factory(originalFactory, { inputs, config }) {
    const strictMode =
      config.strict ?? window.location.hostname === 'localhost';

    const featureFlags = inputs.flag.flatMap(flag =>
      flag.get(flagDataRef).map(
        (flagInfo): FeatureFlag => ({
          ...flagInfo,
          pluginId: flag.node.spec.plugin.id,
        }),
      ),
    );

    return originalFactory(define =>
      define({
        api: persistedFeatureFlagsApiRef,
        deps: {
          errorApi: errorApiRef,
          featureFlagsApi: featureFlagsApiRef,
          storageApi: storageApiRef,
        },
        factory({ errorApi, featureFlagsApi, storageApi }) {
          const alertConflict = (
            newFlag: FeatureFlag,
            existing: FeatureFlag,
          ) => {
            if (!strictMode) {
              return;
            }
            // Show the conflict, if in strict mode.
            // Delayed error posting to ensure the alert gets rendered.
            setTimeout(() => {
              errorApi.post(
                new ConflictError(
                  `Duplicate feature flag name detected: '${newFlag.name}'.\n` +
                    `Defined in plugins '${existing.pluginId}' and '${newFlag.pluginId}'.`,
                ),
              );
            }, 2000);
          };

          const flagsMap = new Map<string, FeatureFlag>();
          featureFlags.forEach(flag => {
            const existing = flagsMap.get(flag.name);

            if (existing) {
              alertConflict(flag, existing);
            } else {
              flagsMap.set(flag.name, flag);
            }
          });

          return new DefaultPersistedFeatureFlagsApi({
            errorApi,
            featureFlagsApi,
            storageApi,
            flags: Array.from(flagsMap.values()),
            strictMode,
          });
        },
      }),
    );
  },
});

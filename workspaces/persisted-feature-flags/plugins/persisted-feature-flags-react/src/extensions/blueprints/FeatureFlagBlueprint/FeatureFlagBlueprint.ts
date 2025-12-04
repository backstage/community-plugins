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

import { createExtensionBlueprint } from '@backstage/frontend-plugin-api';

import { FeatureFlagInfo } from '../../../types';
import { flagDataRef } from '../../apis/api';

/**
 * Blueprint for creating persistant feature flags.
 *
 * For simplicity, you might want to use {@link createPersistedFeatureFlag}
 * instead.
 *
 * @public
 */
export const FeatureFlagBlueprint = createExtensionBlueprint({
  kind: 'flag',
  attachTo: {
    id: 'api:persisted-feature-flags',
    input: 'flag',
  },
  dataRefs: {
    flag: flagDataRef,
  },
  output: [flagDataRef],
  *factory(params: { flags: FeatureFlagInfo | FeatureFlagInfo[] }) {
    const flags = Array.isArray(params.flags) ? params.flags : [params.flags];
    yield flagDataRef(flags);
  },
});

/**
 * Creates an extension of FeatureFlagBlueprint for persisted feature flags.
 *
 * One or multiple feature flags can be created at once by passing in an array.
 *
 * @param flags - The feature flag or array of feature flags to create.
 * @returns An extension of FeatureFlagBlueprint to be attached to a plugin.
 *
 * @public
 */
export function createPersistedFeatureFlag(
  flags: FeatureFlagInfo | FeatureFlagInfo[],
) {
  return FeatureFlagBlueprint.make({
    params: { flags },
  });
}

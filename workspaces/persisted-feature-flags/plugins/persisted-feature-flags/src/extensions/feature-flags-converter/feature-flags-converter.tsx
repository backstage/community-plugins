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

import { useEffect, useMemo } from 'react';

import {
  AppRootElementBlueprint,
  errorApiRef,
  featureFlagsApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';

import {
  persistedFeatureFlagsApiRef,
  useHandleFeatureFlag,
} from '@backstage-community/plugin-persisted-feature-flags-react';

/*
 * Converts feature flags that are enabled in the default feature flags API and
 * are to be enabled in the persisted feature flags API.
 *
 * The logic is as follows:
 *
 *  - For each registered persisted flag that is unset, but is _enabled_ in the
 *    default feature flags API (although _not_ registered there anymore),
 *    enable it in (convert it to) the persisted feature flags API.
 *    This indicates a flag that has been transitioned to being persisted.
 *
 *  - Each such flag (enabled or not) is then marked as "converted" in
 *    localStorage, so it's not handled anymore.
 *
 * The implementation uses a root element blueprint that renders one (non-html)
 * component per such flag, which performs the enabling and marking as
 * converted.
 * They will only be rendered once - when the flag is not yet converted. Upon
 * next page refresh, they will not be rendered again.
 */

class LocalConvertedState {
  static #storageKey = 'converted-feature-flags';

  getConvertedFlags(): string[] {
    const item = window.localStorage.getItem(LocalConvertedState.#storageKey);
    if (!item) {
      return [];
    }
    try {
      const flags = JSON.parse(item) as string[];
      return Array.isArray(flags) ? flags : [];
    } catch {
      return [];
    }
  }
  hasConverted(flagName: string): boolean {
    const converted = this.getConvertedFlags();
    return converted.includes(flagName);
  }
  markConverted(flagName: string) {
    const converted = this.getConvertedFlags();
    if (!converted.includes(flagName)) {
      converted.push(flagName);
      window.localStorage.setItem(
        LocalConvertedState.#storageKey,
        JSON.stringify(converted),
      );
    }
  }
}

function DefaultEnableFeatureFlag({
  convertedState,
  flagName,
}: {
  convertedState: LocalConvertedState;
  flagName: string;
}) {
  const errorApi = useApi(errorApiRef);
  const [_, setFlag, presence] = useHandleFeatureFlag(flagName);

  useEffect(() => {
    if (presence === 'absent') {
      // Convert not yet persisted flags from featureFlagsApi to persisted API
      setFlag(true);
    }
    if (presence) {
      // Flag is converted or already set to a value, don't convert again
      convertedState.markConverted(flagName);
    }
  }, [errorApi, setFlag, convertedState, flagName, presence]);

  return null;
}

// Converts feature flags that are enabled in the default feature flags API
// to be enabled in the persisted feature flags API.
// This keeps the flags enabled when converting them to persisted feature flags.
function FeatureFlagsConverter() {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  const persistedFeatureFlagsApi = useApi(persistedFeatureFlagsApiRef);

  const convertedState = useMemo(() => new LocalConvertedState(), []);

  const registeredLocalFlags = useMemo(
    () => new Set(featureFlagsApi.getRegisteredFlags().map(flag => flag.name)),
    [featureFlagsApi],
  );

  const flagsToConvert = useMemo(
    () =>
      persistedFeatureFlagsApi
        .getPersistedFlags()
        // The flag is not (anymore) registered locally
        .filter(flag => !registeredLocalFlags.has(flag.name))
        // But it is enabled in the local feature flags, so it used to be a
        // local flag
        .filter(flag => featureFlagsApi.isActive(flag.name))
        // And it has not yet been converted
        .filter(flag => !convertedState.hasConverted(flag.name)),
    [
      persistedFeatureFlagsApi,
      registeredLocalFlags,
      featureFlagsApi,
      convertedState,
    ],
  );

  return (
    <>
      {flagsToConvert.map(flag => (
        <DefaultEnableFeatureFlag
          key={flag.name}
          convertedState={convertedState}
          flagName={flag.name}
        />
      ))}
    </>
  );
}

export const featureFlagsConverter = AppRootElementBlueprint.make({
  params(defineParams) {
    return defineParams({
      element: <FeatureFlagsConverter />,
    });
  },
});

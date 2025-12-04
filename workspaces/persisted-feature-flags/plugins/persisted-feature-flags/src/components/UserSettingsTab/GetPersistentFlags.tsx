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

import { useCallback, useState, useEffect } from 'react';

import { useHandleFeatureFlag } from '@backstage-community/plugin-persisted-feature-flags-react';

// Detects the state of multiple persistent feature flags and reports the
// enabled flags to the parent when all are fetched
export function GetPersistentFlags(props: {
  flags: string[];
  onResult: (enabledFlags: string[]) => void;
}) {
  const { flags, onResult } = props;

  const [flagStates, setFlagStates] = useState<[string, boolean][]>([]);

  const onValue = useCallback((flagName: string, value: boolean) => {
    setFlagStates(prev => {
      const existing = prev.find(item => item[0] === flagName);
      if (existing) {
        existing[1] = value;
        return [...prev];
      }
      return [...prev, [flagName, value]];
    });
  }, []);

  useEffect(() => {
    if (flagStates.length === flags.length) {
      onResult(flagStates.filter(state => state[1]).map(state => state[0]));
    }
  }, [onResult, flagStates, flags]);

  return (
    <>
      {flags.map(flagName => (
        <GetPersistedState
          key={`get-persisted-${flagName}`}
          flagName={flagName}
          onValue={onValue}
        />
      ))}
    </>
  );
}

// Detects the state of a persisted feature flag and reports it to the parent
function GetPersistedState({
  flagName,
  onValue,
}: {
  flagName: string;
  onValue: (flagName: string, value: boolean) => void;
}) {
  const [enabled, _, presence] = useHandleFeatureFlag(flagName);

  useEffect(() => {
    if (presence) {
      onValue(flagName, enabled);
    }
  }, [onValue, presence, enabled, flagName]);

  return null;
}

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
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { useFeatureFlag } from '@backstage-community/plugin-persisted-feature-flags-react';

const featureFlags = ['foo-persisted', 'foo-flag', 'bar-persisted', 'bar-flag'];

function FlagEntry({ flagName }: { flagName: string }) {
  const enabled = useFeatureFlag(flagName);
  return (
    <div>
      {flagName} = <strong>{enabled ? 'ON' : 'OFF'}</strong>
    </div>
  );
}

function ShowFlags() {
  return (
    <div>
      <div>Flags:</div>
      <div>
        {featureFlags.map(flagName => (
          <FlagEntry key={flagName} flagName={flagName} />
        ))}
      </div>
    </div>
  );
}

const showFlagsExtension = PageBlueprint.make({
  name: 'Show Flags',
  params: {
    path: '/',
    loader: () => Promise.resolve(<ShowFlags />),
  },
});

export const showFlagsPlugin = createFrontendPlugin({
  pluginId: 'show-flags',
  extensions: [showFlagsExtension],
});

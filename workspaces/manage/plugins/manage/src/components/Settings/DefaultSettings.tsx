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

import { Grid } from '@backstage/ui';

import { TabOrderCard } from './TabOrderCard';
import { KindOrderCard } from './KindOrderCard';
import { SettingsCard } from './SettingsCard/SettingsCard';
import { Setting } from './types';

/**
 * A component that renders the default settings. These are the `TabOrderCard`
 * and `KindOrderCard`.
 *
 * @public
 */
export function DefaultSettings({
  customSettings,
}: {
  readonly customSettings: readonly Setting[];
}) {
  const settings = useMemo(
    () =>
      Array.from(customSettings).sort((a, b) => a.title.localeCompare(b.title)),
    [customSettings],
  );

  return (
    <Grid.Root columns="1">
      <Grid.Item>
        <TabOrderCard />
      </Grid.Item>
      <Grid.Item>
        <KindOrderCard />
      </Grid.Item>
      {settings.map(setting => (
        <Grid.Item key={setting.node?.spec?.id ?? setting.title}>
          <SettingsCard setting={setting} />
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}

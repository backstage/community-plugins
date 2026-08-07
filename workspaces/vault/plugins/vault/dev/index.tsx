/*
 * Copyright 2020 The Backstage Authors
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

import { createDevApp } from '@backstage/dev-utils';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityAboutCard,
  EntityHasSubcomponentsCard,
  EntityLayout,
} from '@backstage/plugin-catalog';
import { Grid } from '@backstage/ui';
import { PropsWithChildren } from 'react';
import { EntityVaultCard } from '../src/components/EntityVaultCard';
import { vaultPlugin } from '../src/plugin';

const SampleEntityPage = ({ children }: PropsWithChildren<{}>) => (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root columns={{ sm: '12' }} gap="6">
        <Grid.Item colSpan={{ sm: '12' }}>
          <EntityAboutCard />
        </Grid.Item>
        {children}
        <Grid.Item colSpan={{ sm: '12' }}>
          <EntityHasSubcomponentsCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);

createDevApp()
  // We need the catalog plugin to get the example entities and make the front entity page functional
  .registerPlugin(catalogPlugin)
  .addPage({
    path: '/catalog',
    title: 'Catalog',
    element: <CatalogIndexPage />,
  })
  // We need the entity page experience to see the linguist card
  .addPage({
    path: '/catalog/:namespace/:kind/:name',
    element: <CatalogEntityPage />,
    children: (
      <SampleEntityPage>
        <Grid.Item colSpan={{ sm: '12' }}>
          <EntityVaultCard />
        </Grid.Item>
      </SampleEntityPage>
    ),
  })
  .registerPlugin(vaultPlugin)
  .render();

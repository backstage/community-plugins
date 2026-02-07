/*
 * Copyright 2022 The Backstage Authors
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
import { PropsWithChildren } from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  linguistPlugin,
  EntityLinguistCard,
  isLinguistAvailable,
} from '../src/plugin';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityAboutCard,
  EntityHasSubcomponentsCard,
  EntityLayout,
  EntitySwitch,
} from '@backstage/plugin-catalog';
import { Grid } from '@backstage/ui';

const SampleEntityPage = ({ children }: PropsWithChildren<{}>) => (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root columns="12" gap="3">
        <Grid.Item colSpan="12">
          <EntityAboutCard variant="gridItem" />
        </Grid.Item>
        {children}
        <Grid.Item colSpan="12">
          <EntityHasSubcomponentsCard variant="gridItem" />
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
        <EntitySwitch>
          <EntitySwitch.Case if={isLinguistAvailable}>
            <Grid.Item colSpan="12">
              <EntityLinguistCard />
            </Grid.Item>
          </EntitySwitch.Case>
        </EntitySwitch>
      </SampleEntityPage>
    ),
  })
  .registerPlugin(linguistPlugin)
  .render();

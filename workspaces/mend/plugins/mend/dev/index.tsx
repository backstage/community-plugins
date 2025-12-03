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
import { createDevApp } from '@backstage/dev-utils';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityAboutCard,
  EntityHasSubcomponentsCard,
  EntityLayout,
} from '@backstage/plugin-catalog';
import Grid from '@mui/material/Unstable_Grid2';
import { MendSidebar, MendPage, plugin, MendTab } from '../src';

import HomeIcon from '@mui/icons-material/Home';

const SampleEntityPage = () => (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid md={12}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        <Grid xs={12}>
          <EntityHasSubcomponentsCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/mend" title="Mend.io">
      <MendTab />
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
    icon: HomeIcon,
  })
  // We need the entity page experience to see the linguist card
  .addPage({
    path: '/catalog/:namespace/:kind/:name',
    element: <CatalogEntityPage />,
    children: <SampleEntityPage />,
  })
  .registerPlugin(plugin)
  .addSidebarItem(<MendSidebar />)
  .addPage({
    element: <MendPage />,
    path: '/mend',
  })
  .render();

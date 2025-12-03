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
import { PropsWithChildren } from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityAboutCard,
  EntityHasSubcomponentsCard,
  EntityLayout,
  EntitySwitch,
} from '@backstage/plugin-catalog';
import Grid from '@mui/material/Unstable_Grid2';
import {
  apiiroPlugin,
  ApiiroPage,
  ApiiroTab,
  ApiiroWidget,
  isApiiroRepoAvailable,
  ApiiroSidebar,
} from '../src';
import HomeIcon from '@mui/icons-material/Home';

const SampleEntityPage = ({ children }: PropsWithChildren<{}>) => (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid md={12}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        {children}
        <Grid xs={12}>
          <EntityHasSubcomponentsCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route
      if={isApiiroRepoAvailable}
      path="/apiiro"
      title="Apiiro"
    >
      <ApiiroTab />
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
    children: (
      <SampleEntityPage>
        <EntitySwitch>
          <EntitySwitch.Case if={isApiiroRepoAvailable}>
            <Grid md={12}>
              <ApiiroWidget />
            </Grid>
          </EntitySwitch.Case>
        </EntitySwitch>
      </SampleEntityPage>
    ),
  })
  .registerPlugin(apiiroPlugin)
  .addSidebarItem(<ApiiroSidebar />)
  .addPage({
    element: <ApiiroPage />,
    path: '/apiiro',
  })
  .render();

/*
 * Copyright 2026 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import {
  EntityCheckmarxCard,
  EntityCheckmarxContentPage,
  EntityCheckmarxRelatedEntitiesOverview,
  checkmarxPlugin,
} from '../src';
import { isCheckmarxAvailable } from '@backstage-community/plugin-checkmarx-react';
import Grid from '@material-ui/core/Grid';

const isSystemEntity = (entity: Entity) =>
  entity.kind.toLocaleLowerCase('en-US') === 'system';

const SampleEntityPage = ({ children }: PropsWithChildren) => (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12}>
          <EntityAboutCard />
        </Grid>
        {children}
        <Grid item xs={12}>
          <EntityHasSubcomponentsCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/checkmarx"
      title="Checkmarx"
      if={isCheckmarxAvailable}
    >
      <EntityCheckmarxContentPage />
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/system-overview"
      title="System overview"
      if={isSystemEntity}
    >
      <EntityCheckmarxRelatedEntitiesOverview
        relationType="hasPart"
        entityKind="component"
      />
    </EntityLayout.Route>
  </EntityLayout>
);

createDevApp()
  .registerPlugin(catalogPlugin)
  .addPage({
    path: '/catalog',
    title: 'Catalog',
    element: <CatalogIndexPage />,
  })
  .addPage({
    path: '/catalog/:namespace/:kind/:name',
    element: <CatalogEntityPage />,
    children: (
      <SampleEntityPage>
        <EntitySwitch>
          <EntitySwitch.Case if={isCheckmarxAvailable}>
            <Grid item xs={12}>
              <EntityCheckmarxCard />
            </Grid>
          </EntitySwitch.Case>
        </EntitySwitch>
      </SampleEntityPage>
    ),
  })
  .registerPlugin(checkmarxPlugin)
  .render();

/*
 * Copyright 2024 The Backstage Authors
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

import { pluginId } from '@backstage-community/plugin-kiali-common';
import { Content, InfoCard, Page } from '@backstage/core-components';
import { createRoutableExtension } from '@backstage/core-plugin-api';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { Grid } from '@material-ui/core';
import { EntityKialiResourcesCard, kialiPlugin } from '../src';
import { KialiHelper } from '../src/pages/Kiali/KialiHelper';
import { KialiNoAnnotation } from '../src/pages/Kiali/KialiNoAnnotation';
import { KialiNoResources } from '../src/pages/Kiali/KialiNoResources';
import { EntityKialiGraphCard } from '../src/plugin';
import { rootRouteRef } from '../src/routes';
import { kialiApiRef } from '../src/services/Api';
import { KialiChecker, ValidationCategory } from '../src/store/KialiProvider';
import { mockEntity, mockEntityAnnotationNoNamespace } from './mockEntity';
import { MockKialiClient } from './MockProvider';

const KialiMock = kialiPlugin.provide(
  createRoutableExtension({
    name: 'KialiPage',
    component: () => import('./MockProvider').then(m => m.MockProvider),
    mountPoint: rootRouteRef,
  }),
);

const MockEntityCard = () => {
  const content = (
    <EntityProvider entity={mockEntity}>
      <div style={{ padding: '20px' }}>
        <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item md={8} xs={12}>
              <EntityKialiResourcesCard />
            </Grid>
          </Grid>
        </TestApiProvider>
      </div>
    </EntityProvider>
  );

  return (
    <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
      {content}
    </TestApiProvider>
  );
};

const MockEntityGraphCard = () => {
  const content = (
    <EntityProvider entity={mockEntity}>
      <div style={{ padding: '20px' }}>
        <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item md={8} xs={12}>
              <EntityKialiGraphCard />
            </Grid>
          </Grid>
        </TestApiProvider>
      </div>
    </EntityProvider>
  );

  return (
    <TestApiProvider apis={[[kialiApiRef, new MockKialiClient()]]}>
      {content}
    </TestApiProvider>
  );
};

const MockKialiError = () => {
  const errorsTypes: KialiChecker[] = [
    {
      verify: false,
      title: 'Error reaching Kiali',
      message: ' Error status code 502',
      category: ValidationCategory.networking,
      helper: 'Check if http://kialiendpoint works',
    },
    {
      verify: false,
      title: 'Authentication failed. Missing Configuration',
      message: `Attribute 'serviceAccountToken' is not in the backstage configuration`,
      category: ValidationCategory.configuration,
      helper: 'Check if http://kialiendpoint works',
      missingAttributes: ['serviceAccountToken'],
    },
    {
      verify: false,
      title: 'Authentication failed. Not supported',
      message: `Strategy oauth2 is not supported in Kiali backstage plugin yet`,
      category: ValidationCategory.configuration,
    },
    {
      verify: false,
      title: 'Authentication failed',
      message: `We can't authenticate`,
      category: ValidationCategory.authentication,
    },
    {
      verify: false,
      title: 'Unkown error ',
      message: `Internal error`,
      category: ValidationCategory.unknown,
    },
    {
      verify: false,
      title: 'kiali version not supported',
      message: `Kiali version supported is v1.74, we found version v1.80`,
      category: ValidationCategory.versionSupported,
    },
    {
      verify: true,
      title: 'True verification, we not expect something',
      category: ValidationCategory.unknown,
    },
  ];

  return (
    <Page themeId="tool">
      <Content data-test="Kiali Errors">
        <Grid container direction="column">
          {errorsTypes.map(error => (
            <Grid item>
              <InfoCard
                title={`Error type : ${error.category} -- ${error.title}`}
              >
                <KialiHelper check={error} />
              </InfoCard>
            </Grid>
          ))}
        </Grid>
      </Content>
    </Page>
  );
};

createDevApp()
  .registerPlugin(kialiPlugin)
  .addPage({
    element: <KialiMock />,
    title: 'KialiPage',
    path: `/${pluginId}`,
  })
  .addPage({
    element: <MockKialiError />,
    title: 'Kiali error',
    path: `/kiali-error`,
  })
  .addPage({
    element: <KialiNoResources entity={mockEntityAnnotationNoNamespace} />,
    title: 'No resource',
    path: '/no-resource',
  })
  .addPage({
    element: <KialiNoAnnotation />,
    title: 'No Annotation',
    path: '/no-annotation',
  })
  .addPage({
    element: <MockEntityCard />,
    title: 'Resources card',
    path: '/kiali-entity-card',
  })
  .addPage({
    element: <MockEntityGraphCard />,
    title: 'Graph card',
    path: '/kiali-graph-card',
  })
  .render();

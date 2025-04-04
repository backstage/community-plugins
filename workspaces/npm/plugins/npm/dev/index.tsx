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
import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Content, Header, Page } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import {
  npmPlugin,
  EntityNpmInfoCard,
  EntityNpmReleaseTableCard,
} from '../src/plugin';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage-plugin-catalog',
    annotations: {
      // Workaround to disable backend communication in plugin-test-app
      'npm/__devapp__': 'true',
      'npm/package': '@backstage/plugin-catalog',
    },
  },
  spec: {
    type: 'website',
    lifecycle: 'production',
    owner: 'guests',
  },
};

createDevApp()
  .registerPlugin(npmPlugin)
  .addPage({
    element: (
      <Page themeId="tool">
        <Header title="Npm demo application" subtitle="standalone app" />
        <Content>
          <EntityProvider entity={mockEntity}>
            <Grid container>
              <Grid item xs={8}>
                <EntityNpmReleaseTableCard />
              </Grid>
              <Grid item xs={4}>
                <EntityNpmInfoCard />
              </Grid>
            </Grid>
          </EntityProvider>
        </Content>
      </Page>
    ),
    title: 'Npm',
    path: '/npm',
  })
  .render();

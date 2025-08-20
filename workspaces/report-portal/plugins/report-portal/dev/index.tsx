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
import { createDevApp } from '@backstage/dev-utils';
import {
  reportPortalPlugin,
  ReportPortalGlobalPage,
  ReportPortalOverviewCard,
} from '../src/plugin';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { mockEntity } from '../src/mocks';
import Grid from '@mui/material/Grid';

createDevApp()
  .registerPlugin(reportPortalPlugin)
  .addPage({
    element: <ReportPortalGlobalPage />,
    title: 'Root Page',
    path: '/report-portal',
  })
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <Grid container xs={6} padding={4}>
          <ReportPortalOverviewCard variant="flex" />
        </Grid>
      </EntityProvider>
    ),
    title: 'Overview Card',
    path: '/redacted/entitypage',
  })
  .render();

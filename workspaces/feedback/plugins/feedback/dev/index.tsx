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
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityLayout,
} from '@backstage/plugin-catalog';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import {
  EntityFeedbackPage,
  feedbackPlugin,
  GlobalFeedbackPage,
  OpcFeedbackComponent,
} from '../src/plugin';

createDevApp()
  .registerPlugin(feedbackPlugin)
  .registerPlugin(catalogPlugin)
  .addThemes(getAllThemes())
  .addPage({
    element: (
      <>
        <GlobalFeedbackPage /> <OpcFeedbackComponent />
      </>
    ),
    title: 'Root Page',
    path: '/feedback',
  })
  .addPage({
    element: (
      <>
        <CatalogIndexPage />
        <OpcFeedbackComponent />
      </>
    ),
    title: 'Catalog',
    path: '/catalog',
  })
  .addPage({
    title: 'Entity Page',
    path: '/catalog/:namespace/:kind/:name',
    element: (
      <>
        <CatalogEntityPage />
        <OpcFeedbackComponent />
      </>
    ),
    children: (
      <EntityLayout>
        <EntityLayout.Route path="feedback" title="Feedback">
          <EntityFeedbackPage />
        </EntityLayout.Route>
      </EntityLayout>
    ),
  })
  .render();

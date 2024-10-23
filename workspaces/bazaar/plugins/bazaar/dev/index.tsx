/*
 * Copyright 2021 The Backstage Authors
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
import { bazaarPlugin } from '../src/plugin';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { createRoutableExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from '../src/routes';

export const HomePage = catalogPlugin.provide(
  createRoutableExtension({
    name: 'BazaarPage',
    component: () => import('../src/components/HomePage').then(m => m.HomePage),
    mountPoint: entityRouteRef,
  }),
);

export const BazaarOverviewCard = bazaarPlugin.provide(
  createRoutableExtension({
    name: 'BazaarOverviewCard',
    component: () =>
      import('../src/components/BazaarOverviewCard').then(
        m => m.BazaarOverviewCard,
      ),
    mountPoint: rootRouteRef,
  }),
);

createDevApp()
  .registerPlugin(bazaarPlugin)
  .addPage({
    element: <HomePage />,
    title: 'HomePage',
  })
  .addPage({
    element: (
      <BazaarOverviewCard
        order="latest"
        title="Bazaar Dev Overview Widget (Latest)"
      />
    ),
    title: 'BazaarOverviewCard',
  })
  .render();

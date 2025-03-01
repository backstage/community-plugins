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
import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

/** @public */
export const manageReactPlugin = createPlugin({
  id: 'manage-react',
});

/** @public */
export const OwnedProvider = manageReactPlugin.provide(
  createComponentExtension({
    name: 'OwnedProvider',
    component: {
      lazy: () =>
        import('./components/OwnedEntitiesProvider').then(
          m => m.ManageOwnedProvider,
        ),
    },
  }),
);

/** @public */
export const TabContentFullHeight = manageReactPlugin.provide(
  createComponentExtension({
    name: 'TabContentFullHeight',
    component: {
      lazy: () =>
        import('./components/TabContentFullHeight').then(
          m => m.ManageTabContentFullHeight,
        ),
    },
  }),
);

/** @public */
export const GaugeCard = manageReactPlugin.provide(
  createComponentExtension({
    name: 'GaugeCard',
    component: {
      lazy: () => import('./components/GaugeCard').then(m => m.ManageGaugeCard),
    },
  }),
);

/** @public */
export const GaugeGrid = manageReactPlugin.provide(
  createComponentExtension({
    name: 'GaugeGrid',
    component: {
      lazy: () => import('./components/GaugeGrid').then(m => m.ManageGaugeGrid),
    },
  }),
);

/** @public */
export const ReorderableTabs = manageReactPlugin.provide(
  createComponentExtension({
    name: 'ReorderableTabs',
    component: {
      lazy: () =>
        import('./components/ReorderableTabs').then(
          m => m.ManageReorderableTabs,
        ),
    },
  }),
);

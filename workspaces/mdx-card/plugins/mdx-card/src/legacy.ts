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
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { createCardExtension } from '@backstage/plugin-home-react';
import { MdxCardClient, mdxCardApiRef } from './api';
import type { MdxCardProps } from './types';

const editorRouteRef = createRouteRef({ id: 'mdx-card:editor' });

/**
 * MDX card plugin for the legacy frontend system.
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const mdxCardPlugin = createPlugin({
  id: 'mdx-card',
  routes: { editor: editorRouteRef },
  apis: [
    createApiFactory({
      api: mdxCardApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new MdxCardClient({ discoveryApi, fetchApi }),
    }),
  ],
});

/**
 * Entity page card that renders an MDX template with the current entity in
 * scope.
 *
 * @public
 */
export const EntityMdxCard = mdxCardPlugin.provide(
  createComponentExtension({
    name: 'EntityMdxCard',
    component: {
      lazy: () =>
        import('./components/EntityMdxCard').then(m => m.EntityMdxCard),
    },
  }),
);

/**
 * Home page card that renders an MDX template.
 *
 * @public
 */
export const HomePageMdxCard = mdxCardPlugin.provide(
  createCardExtension<MdxCardProps>({
    name: 'HomePageMdxCard',
    title: 'MDX Card',
    components: () => import('./components/HomePageMdxCard'),
  }),
);

/**
 * Page for creating, editing and previewing stored MDX card templates.
 *
 * @public
 */
export const MdxCardEditorPage = mdxCardPlugin.provide(
  createRoutableExtension({
    name: 'MdxCardEditorPage',
    component: () =>
      import('./components/MdxCardEditorPage').then(
        m => m.LegacyMdxCardEditorPage,
      ),
    mountPoint: editorRouteRef,
  }),
);

export { MdxCardClient, mdxCardApiRef } from './api';
export type { MdxCardApi } from './api';
export type { DataFetcher, MdxCardProps, UserInformation } from './types';
export type { EntityMdxCardProps } from './components/EntityMdxCard';

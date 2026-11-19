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
  ApiBlueprint,
  createFrontendPlugin,
  createRouteRef,
  discoveryApiRef,
  fetchApiRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { z } from 'zod';
import { MdxCardClient, mdxCardApiRef } from './api';

const cardConfigSchema = {
  title: z.string().optional(),
  template: z.string().optional(),
  templateRef: z.string().optional(),
  dataFetchers: z
    .array(
      z.object({
        name: z.string(),
        pluginId: z.string(),
        apiUrl: z.string(),
      }),
    )
    .default([]),
};

/**
 * Route to the MDX card editor page.
 *
 * @public
 */
export const mdxCardEditorRouteRef = createRouteRef();

/**
 * Client for the MDX card backend.
 *
 * @public
 */
export const mdxCardApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: mdxCardApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new MdxCardClient({ discoveryApi, fetchApi }),
    }),
});

/**
 * Entity page card that renders an MDX template from its extension config,
 * either inline or referenced from the MDX card backend.
 *
 * @public
 */
export const mdxEntityCard = EntityCardBlueprint.makeWithOverrides({
  disabled: true,
  configSchema: cardConfigSchema,
  factory(originalFactory, { config }) {
    return originalFactory({
      loader: () =>
        import('./components/EntityMdxCard').then(m => (
          <m.EntityMdxCard
            title={config.title}
            template={config.template}
            templateRef={config.templateRef}
            dataFetchers={config.dataFetchers}
          />
        )),
    });
  },
});

/**
 * Home page widget that renders an MDX template from its extension config,
 * either inline or referenced from the MDX card backend.
 *
 * @public
 */
export const mdxHomePageWidget = HomePageWidgetBlueprint.makeWithOverrides({
  disabled: true,
  configSchema: cardConfigSchema,
  factory(originalFactory, { config }) {
    return originalFactory({
      title: config.title ?? 'MDX Card',
      description: 'Renders an MDX template with data from backend APIs',
      components: () => import('./components/HomePageMdxCard'),
      componentProps: {
        template: config.template,
        templateRef: config.templateRef,
        dataFetchers: config.dataFetchers,
      },
    });
  },
});

/**
 * Page for creating, editing and previewing stored MDX card templates.
 *
 * @public
 */
export const mdxCardEditorPage = PageBlueprint.make({
  disabled: true,
  params: {
    path: '/mdx-cards',
    title: 'MDX Cards',
    icon: <DashboardCustomizeIcon fontSize="inherit" />,
    routeRef: mdxCardEditorRouteRef,
    loader: () =>
      import('./components/MdxCardEditorPage').then(m => (
        <m.MdxCardEditorPage />
      )),
  },
});

/**
 * MDX card plugin for the new frontend system.
 *
 * @public
 */
export default createFrontendPlugin({
  pluginId: 'mdx-card',
  info: { packageJson: () => import('../package.json') },
  routes: { editor: mdxCardEditorRouteRef },
  extensions: [mdxCardApi, mdxEntityCard, mdxHomePageWidget, mdxCardEditorPage],
});

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
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';
import { z } from 'zod';

const cardConfigSchema = {
  title: z.string().optional(),
  template: z.string(),
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
 * Entity page card that renders the MDX template from its extension config.
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
            dataFetchers={config.dataFetchers}
          />
        )),
    });
  },
});

/**
 * Home page widget that renders the MDX template from its extension config.
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
        dataFetchers: config.dataFetchers,
      },
    });
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
  extensions: [mdxEntityCard, mdxHomePageWidget],
});

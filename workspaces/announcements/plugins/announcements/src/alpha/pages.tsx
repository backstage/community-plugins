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
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { PageBlueprint } from '@backstage/frontend-plugin-api';
import { rootRouteRef } from '../routes';

/**
 * @alpha
 */
export const announcementsPage = PageBlueprint.makeWithOverrides({
  config: {
    schema: {
      /**
       * @deprecated Filter by category using URL state (e.g. ?category=...). This option will be removed.
       */
      category: z => z.string().optional(),
      hideStartAt: z => z.boolean().optional(),
      markdownRenderer: z => z.enum(['backstage', 'md-editor']).optional(),
      /**
       * @deprecated Inactive announcement are hidden by default. This option will be removed.
       */
      defaultInactive: z => z.boolean().optional(),
    },
  },
  factory: (originalFactory, { config }) =>
    originalFactory({
      path: '/announcements',
      routeRef: convertLegacyRouteRef(rootRouteRef),
      loader: async () =>
        import('../Router').then(m =>
          compatWrapper(
            <m.Router
              title={config.title}
              category={config.category}
              hideStartAt={config.hideStartAt}
              markdownRenderer={config.markdownRenderer}
              defaultInactive={config.defaultInactive}
            />,
          ),
        ),
    }),
});

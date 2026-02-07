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

import { Box } from '@backstage/ui';

import {
  ManageEntityCardWidgetBlueprint,
  ManageEntityContentWidgetBlueprint,
} from '@backstage-community/plugin-manage-react';

export const manageTechInsightsCardWidgetsGrid =
  ManageEntityCardWidgetBlueprint.makeWithOverrides({
    name: 'grid',
    factory(originalFactory) {
      return originalFactory(defineParams =>
        defineParams({
          card: () =>
            import('../components/Grid').then(m => ({
              title: 'Tech Insights',
              content: (
                <Box style={{ maxWidth: 800 }}>
                  <m.ManageTechInsightsGrid inAccordion={false} />
                </Box>
              ),
            })),
          attachTo: [],
        }),
      );
    },
  });

export const manageTechInsightsCards =
  ManageEntityContentWidgetBlueprint.makeWithOverrides({
    name: 'cards',
    factory(originalFactory) {
      return originalFactory(defineParams =>
        defineParams({
          accordion: {
            accordionTitle: ({ kindTitle }) =>
              `Tech insights of your ${kindTitle}`,
            key: 'tech-insights',
            show: true,
          },
          showTitle: true,
          loader: () =>
            import('../components/Cards').then(m => (
              <m.ManageTechInsightsCards inAccordion={false} />
            )),
          attachTo: ['component', 'system', '$entities', '$starred'],
        }),
      );
    },
  });

export const manageTechInsightsGrid =
  ManageEntityContentWidgetBlueprint.makeWithOverrides({
    name: 'grid',
    factory(originalFactory) {
      return originalFactory(defineParams =>
        defineParams({
          accordion: {
            accordionTitle: ({ kindTitle }) =>
              `Tech insights of your ${kindTitle}`,
            key: 'tech-insights',
            show: false,
          },
          showTitle: true,
          loader: () =>
            import('../components/Grid').then(m => (
              <m.ManageTechInsightsGrid inAccordion={false} />
            )),
          attachTo: [],
        }),
      );
    },
  });

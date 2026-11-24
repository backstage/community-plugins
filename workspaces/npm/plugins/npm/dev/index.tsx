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
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { PageLayout } from '@backstage/frontend-plugin-api';
import { Grid, Container } from '@backstage/ui';

import {
  npmPlugin,
  EntityNpmInfoCard,
  EntityNpmReleaseTableCard,
  EntityNpmReleaseOverviewCard,
} from '../src/plugin';

import { npmTranslations } from '../src/translations';

// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { allExamples } from '../../../examples';

const builder = createDevApp()
  .registerPlugin(npmPlugin)
  .addTranslationResource(npmTranslations)
  .setAvailableLanguages(['en', 'de', 'es']);

allExamples.forEach(example => {
  builder.addPage({
    element: (
      <EntityProvider entity={example}>
        <PageLayout title={example.metadata.name}>
          <Container pt="4">
            <Grid.Root columns="3">
              <Grid.Item colSpan="1">
                <EntityNpmInfoCard />
              </Grid.Item>
              <Grid.Item colSpan="1">
                <EntityNpmReleaseOverviewCard />
              </Grid.Item>
              <Grid.Item colSpan="1">
                <EntityNpmReleaseTableCard />
              </Grid.Item>
            </Grid.Root>
          </Container>
        </PageLayout>
      </EntityProvider>
    ),
    title: example.metadata.name,
    path: `/${example.metadata.name}`,
  });
});

builder.render();

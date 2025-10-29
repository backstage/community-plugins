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
import { Content, Header, Page } from '@backstage/core-components';
import { Grid } from '@material-ui/core';

import {
  npmPlugin,
  EntityNpmInfoCard,
  EntityNpmReleaseTableCard,
  EntityNpmReleaseOverviewCard,
} from '../src/plugin';

import { npmTranslations } from '../src/translations';

import { allExamples } from './examples';

const builder = createDevApp()
  .registerPlugin(npmPlugin)
  .addTranslationResource(npmTranslations)
  .setAvailableLanguages(['en', 'de']);

allExamples.forEach(example => {
  builder.addPage({
    element: (
      <Page themeId="tool">
        <Header title={example.metadata.name} />
        <Content>
          <EntityProvider entity={example}>
            <Grid container>
              <Grid item xs={6}>
                <EntityNpmInfoCard />
              </Grid>
              <Grid item xs={6}>
                <EntityNpmReleaseOverviewCard />
              </Grid>
              <Grid item xs={12}>
                <EntityNpmReleaseTableCard />
              </Grid>
            </Grid>
          </EntityProvider>
        </Content>
      </Page>
    ),
    title: example.metadata.name,
    path: `/${example.metadata.name}`,
  });
});

builder.render();

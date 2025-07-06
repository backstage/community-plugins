/*
 * Copyright 2023 The Backstage Authors
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
import { Page, Header, Content } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import {
  entityValidationPlugin,
  EntityValidationPage,
  EntityValidationContent,
} from '../src/plugin';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';

import Typography from '@material-ui/core/Typography';

const EmbedExamplePage = () => {
  return (
    <Page themeId="tool">
      <Header title="Embed Example" />
      <Content>
        <EntityValidationContent
          contentHead={<Typography variant="h6">Entity Validation</Typography>}
        />
      </Content>
    </Page>
  );
};

createDevApp()
  .registerPlugin(entityValidationPlugin)
  .registerApi({
    api: catalogApiRef,
    deps: {},
    factory: () =>
      ({
        getEntities: () => ({}),
      } as CatalogApi),
  })
  .addPage({
    element: <EntityValidationPage />,
    title: 'Root Page',
    path: '/entity-validation',
  })
  .addPage({
    element: <EmbedExamplePage />,
    title: 'Embedded Page',
    path: '/entity-validation-embed',
  })
  .render();

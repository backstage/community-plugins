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

import { createDevApp } from '@backstage/dev-utils';
import {
  TechDocsEditorApiRef,
  TechDocsEditorClient,
  TechDocsEditorPage,
} from '@backstage-community/plugin-techdocs-editor-react';
import {
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

createDevApp()
  .registerApi(
    createApiFactory({
      api: TechDocsEditorApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new TechDocsEditorClient(discoveryApi, fetchApi),
    }),
  )
  .addPage({
    element: (
      <TechDocsEditorPage
        entityRef={{
          namespace: 'default',
          kind: 'component',
          name: 'my-service',
        }}
      />
    ),
    title: 'TechDocs Editor',
    path: '/techdocs-editor',
  })
  .render();

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

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import { jenkinsApiRef } from '../src/api';
import { EntityJenkinsContent, jenkinsPlugin } from '../src/legacy';
import { mockJenkinsEntity } from './__data__/entity';
import { MockJenkinsApi } from './__data__/jenkins';

createDevApp()
  .registerPlugin(jenkinsPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[jenkinsApiRef, new MockJenkinsApi()]]}>
        <EntityProvider entity={mockJenkinsEntity}>
          <EntityJenkinsContent />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Jenkins',
    path: '/jenkins',
  })
  .render();

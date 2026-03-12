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
import '@backstage/ui/css/styles.css';
import { configApiRef } from '@backstage/core-plugin-api';
import { createDevApp } from '@backstage/dev-utils';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { mockApis, TestApiProvider } from '@backstage/test-utils';

import { rbacApiRef } from '../src/api/RBACBackendClient';
import { RbacPage, rbacPlugin } from '../src/plugin';
import { rbacTranslations } from '../src/alpha/translations';
import { mockConfigApi, mockRBACApi } from './mocks';

createDevApp()
  .registerPlugin(rbacPlugin)
  .addTranslationResource(rbacTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'ja'])
  .setDefaultLanguage('en')
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [permissionApiRef, mockApis.permission()],
          [rbacApiRef, mockRBACApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <RbacPage />
      </TestApiProvider>
    ),
    title: 'RBAC',
    path: '/rbac',
  })
  .render();

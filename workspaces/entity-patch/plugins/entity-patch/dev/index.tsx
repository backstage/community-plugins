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
import { createDevApp } from '@backstage/frontend-dev-utils';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { EntityNamePickerFieldExtension } from '@backstage/plugin-scaffolder';
import {
  FormFieldBlueprint,
  createFormField,
} from '@backstage/plugin-scaffolder-react/alpha';

import plugin from '../src';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Group',
  metadata: {
    name: 'example-team',
    namespace: 'default',
    description: 'Initial description',
    annotations: { 'slack/channel': '#team-example' },
  },
  spec: {
    type: 'team',
    profile: { email: 'team@example.com' },
    owner: 'group:default/platform',
    children: [],
    members: [],
  },
};

const mockDepartmentGroup = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Group',
  metadata: {
    name: 'engineering',
    namespace: 'default',
    description: 'The engineering department',
  },
  spec: {
    type: 'department',
    children: ['group:default/example-team'],
    members: [],
  },
};

const mockPlatformGroup = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Group',
  metadata: { name: 'platform', namespace: 'default' },
  spec: { type: 'team', children: [], members: [] },
};

const mockJohnUser = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'User',
  metadata: { name: 'jdoe', namespace: 'default' },
  spec: { profile: { displayName: 'John Doe' }, memberOf: [] },
};

const mockServiceComponent = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Component',
  metadata: {
    name: 'payments-api',
    namespace: 'default',
    description: 'Handles payment processing',
    annotations: {
      'internal/tier': 'tier-1',
      'pagerduty.com/integration-key': 'abc123def456abc123def456abc123de',
      'backstage.io/runbook-url': 'https://wiki.example.com/runbooks/payments',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'group:default/example-team',
  },
};

const mockLibraryComponent = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Component',
  metadata: {
    name: 'ui-kit',
    namespace: 'default',
    description: 'Shared UI component library',
  },
  spec: {
    type: 'library',
    lifecycle: 'experimental',
    owner: 'group:default/example-team',
  },
};

const catalogApi = catalogApiMock({
  entities: [
    mockEntity,
    mockDepartmentGroup,
    mockPlatformGroup,
    mockJohnUser,
    mockServiceComponent,
    mockLibraryComponent,
  ],
});

const catalogMockModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApi,
        }),
    }),
  ],
});

// Register the built-in EntityNamePicker scaffolder field extension so that
// patches using `ui:field: EntityNamePicker` work in the dev environment.
// In production, the scaffolder plugin in the new frontend system should register
// these automatically via FormFieldBlueprint once the alpha API stabilises.
const entityNamePickerField = FormFieldBlueprint.make({
  name: 'entity-name-picker',
  params: {
    field: async () =>
      createFormField({
        name: 'EntityNamePicker',
        component: EntityNamePickerFieldExtension as any,
      }),
  },
});

createDevApp({
  features: [
    plugin,
    catalogPlugin,
    scaffolderPlugin,
    catalogMockModule,
    entityNamePickerField,
    // configMockModule,
  ],
});

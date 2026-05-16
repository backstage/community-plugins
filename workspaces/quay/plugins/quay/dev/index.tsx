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

// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { mockApis, TestApiProvider } from '@backstage/test-utils';

import { quayApiRef, QuayApiV1, QuayInstanceConfig } from '../src/api';
import { QuayPage, quayPlugin } from '../src/plugin';
import { mockQuayEntity, mockQuayInstanceDevelEntity } from './__data__/entity';
import { labels } from './__data__/labels';
import { manifestDigest } from './__data__/manifest_digest';
import {
  digestSecurityDetails,
  securityDetails,
  v1securityDetails,
} from './__data__/security_vulnerabilities';
import { tags } from './__data__/tags';

export class MockQuayApiClient implements QuayApiV1 {
  getQuayInstance(instanceName?: string): QuayInstanceConfig | undefined {
    if (instanceName === 'devel') {
      return { name: 'devel', apiUrl: 'https://quay-devel.io' };
    }

    return { name: 'default', apiUrl: 'https://quay.io' };
  }

  async getTags(instanceName?: string) {
    if (instanceName === 'devel') {
      return {
        tags: [
          {
            ...tags.tags[0],
            name: 'v5-devel-only',
          },
        ],
        page: 1,
        has_additional: false,
      };
    }

    return tags;
  }

  async getLabels() {
    return labels;
  }

  async getManifestByDigest() {
    return manifestDigest;
  }

  async getSecurityDetails(
    instanceName: string | undefined,
    _: string,
    __: string,
    digest: string,
  ) {
    if (instanceName === 'devel') {
      return { ...v1securityDetails };
    }

    return digestSecurityDetails[digest] ?? securityDetails;
  }
}

createDevApp()
  .registerPlugin(quayPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [quayApiRef, new MockQuayApiClient()],
          [permissionApiRef, mockApis.permission()],
        ]}
      >
        <EntityProvider entity={mockQuayEntity}>
          <QuayPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/quay',
  })
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [quayApiRef, new MockQuayApiClient()],
          [permissionApiRef, mockApis.permission()],
        ]}
      >
        <EntityProvider
          key="multi-instance"
          entity={mockQuayInstanceDevelEntity}
        >
          <QuayPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Multi-instance',
    path: '/quay/multi-instance',
  })
  .render();

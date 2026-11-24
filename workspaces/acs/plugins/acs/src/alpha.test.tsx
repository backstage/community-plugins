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
import { coreExtensionData } from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  mockApis,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import acsPlugin from './alpha';

describe('ACS on the new frontend system', () => {
  it('registers and renders the Security tab for an annotated entity', async () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'example',
        annotations: { 'acs/deployment-name': 'example-deployment' },
      },
    };
    const extension = createExtensionTester(
      acsPlugin.getExtension('entity-content:acs/security'),
    );

    expect(extension.get(EntityContentBlueprint.dataRefs.title)).toBe(
      'Security',
    );
    expect(extension.get(coreExtensionData.routePath)).toBe('acs');
    const filter = extension.get(
      EntityContentBlueprint.dataRefs.filterFunction,
    );
    expect(filter?.(entity)).toBe(true);
    expect(filter?.({ ...entity, metadata: { name: 'example' } })).toBe(false);

    const acsUrl = 'https://acs.example.com';
    const backendUrl = 'http://localhost:7007';
    const fetch = jest.fn().mockResolvedValue({ text: async () => '' });
    renderInTestApp(
      <EntityProvider entity={entity}>
        {extension.reactElement()}
      </EntityProvider>,
      {
        config: {
          app: { baseUrl: 'http://localhost:3000' },
          backend: { baseUrl: backendUrl },
          acs: { acsUrl },
        },
        apis: [
          mockApis.discovery({ baseUrl: backendUrl }),
          mockApis.fetch({ baseImplementation: fetch }),
        ],
      },
    );

    expect(
      await screen.findByRole('link', {
        name: 'View in Advanced Cluster Security',
      }),
    ).toHaveAttribute('href', acsUrl);
    expect(
      await screen.findByText('No results found for query example-deployment.'),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      `${backendUrl}/api/proxy/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3Aexample-deployment`,
    );
  });
});

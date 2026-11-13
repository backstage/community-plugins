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

import { screen } from '@testing-library/react';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { discoveryApiRef } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { adrApiRef } from '../../api';
import { rootRouteRef } from '../../routes';
import { EntityAdrContent } from './EntityAdrContent';

const adrDirectory =
  'https://gitlab.example.com/team/service/-/blob/main/docs/adr';
const firstAdr = '0001-first-decision.md';
const secondAdr = '0002-second-decision.md';

describe('EntityAdrContent', () => {
  it.each([
    ['', firstAdr],
    ['?record=missing.md', firstAdr],
    [`?record=${secondAdr}`, secondAdr],
  ])(
    'reads only the selected markdown file when opening the tab with "%s"',
    async (query, selectedAdr) => {
      const readAdr = jest.fn().mockResolvedValue({
        data: '# Decision\n\nArchitecture decision content.',
      });
      const listAdrs = jest.fn().mockResolvedValue({
        data: [
          { type: 'file', name: firstAdr, path: firstAdr },
          { type: 'file', name: secondAdr, path: secondAdr },
        ],
      });

      await renderInTestApp(
        <TestApiProvider
          apis={[
            [adrApiRef, { listAdrs, readAdr }],
            [discoveryApiRef, mockApis.discovery()],
            [
              scmIntegrationsApiRef,
              { resolveUrl: ({ url, base }) => new URL(url, base).href },
            ],
          ]}
        >
          <EntityProvider
            entity={{
              apiVersion: 'backstage.io/v1alpha1',
              kind: 'Component',
              metadata: {
                name: 'service',
                annotations: {
                  'backstage.io/source-location':
                    'url:https://gitlab.example.com/team/service/-/blob/main/catalog-info.yaml',
                  'backstage.io/adr-location': 'docs/adr',
                },
              },
            }}
          >
            <EntityAdrContent />
          </EntityProvider>
        </TestApiProvider>,
        {
          routeEntries: [`/adrs${query}`],
          mountedRoutes: { '/adrs': rootRouteRef },
        },
      );

      expect(
        await screen.findByText('Architecture decision content.'),
      ).toBeInTheDocument();
      expect(listAdrs).toHaveBeenCalledWith(adrDirectory);
      expect(readAdr).not.toHaveBeenCalledWith(adrDirectory);
      expect(readAdr).toHaveBeenCalledTimes(1);
      expect(readAdr).toHaveBeenCalledWith(`${adrDirectory}/${selectedAdr}`);
    },
  );
});

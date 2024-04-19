/*
 * Copyright 2020 The Backstage Authors
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

import {
  catalogApiRef,
  CatalogApi,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import React from 'react';
import { GroupsDiagram } from './GroupsDiagram';

describe('<GroupsDiagram />', () => {
  beforeAll(() => {
    Object.defineProperty(window.SVGElement.prototype, 'getBBox', {
      value: () => ({ width: 100, height: 100 }),
      configurable: true,
    });
  });

  it('show single group', async () => {
    const catalogApi: Partial<CatalogApi> = {
      getEntities: () =>
        Promise.resolve({
          items: [
            {
              apiVersion: 'backstage.io/v1alpha1',
              kind: 'Group',
              metadata: {
                name: 'group-a',
                namespace: 'my-namespace',
              },
              spec: {
                profile: {
                  displayName: 'Group A',
                },
                type: 'organization',
              },
            },
          ] as Entity[],
        }),
    };

    await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <GroupsDiagram />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(
      screen.getByRole('link', { name: 'my-namespace/group-a' }),
    ).toBeInTheDocument();
  });
});

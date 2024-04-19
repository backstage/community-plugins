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

import { Entity } from '@backstage/catalog-model';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { waitFor, screen } from '@testing-library/react';
import React from 'react';
import { GroupsExplorerContent } from '../GroupsExplorerContent';

describe('<GroupsExplorerContent />', () => {
  const catalogApi = {
    addLocation: jest.fn(),
    getEntities: jest.fn(),
    getLocationByRef: jest.fn(),
    getLocationById: jest.fn(),
    removeLocationById: jest.fn(),
    removeEntityByUid: jest.fn(),
    getEntityByRef: jest.fn(),
    refreshEntity: jest.fn(),
    getEntityAncestors: jest.fn(),
    getEntityFacets: jest.fn(),
    validateEntity: jest.fn(),
  };

  const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
      {children}
    </TestApiProvider>
  );

  const mountedRoutes = {
    mountedRoutes: {
      '/catalog/:namespace/:kind/:name': entityRouteRef,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();

    Object.defineProperty(window.SVGElement.prototype, 'getBBox', {
      value: () => ({ width: 100, height: 100 }),
      configurable: true,
    });
  });

  it('renders a groups diagram', async () => {
    const entities: Entity[] = [
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        metadata: {
          name: 'group-a',
          namespace: 'my-namespace',
        },
        spec: {
          type: 'organization',
        },
      },
    ];
    catalogApi.getEntities.mockResolvedValue({ items: entities });

    await renderInTestApp(
      <Wrapper>
        <GroupsExplorerContent />
      </Wrapper>,
      mountedRoutes,
    );

    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'my-namespace/group-a' }),
      ).toBeInTheDocument(),
    );
  });

  it('renders a custom title', async () => {
    catalogApi.getEntities.mockResolvedValue({ items: [] });

    await renderInTestApp(
      <Wrapper>
        <GroupsExplorerContent title="Our Teams" />
      </Wrapper>,
      mountedRoutes,
    );

    await waitFor(() =>
      expect(
        screen.getByText('Our Teams', { selector: 'h2' }),
      ).toBeInTheDocument(),
    );
  });

  it('renders a friendly error if it cannot collect domains', async () => {
    const catalogError = new Error('Network timeout');
    catalogApi.getEntities.mockRejectedValueOnce(catalogError);

    await renderInTestApp(
      <Wrapper>
        <GroupsExplorerContent />
      </Wrapper>,
      mountedRoutes,
    );

    await waitFor(() =>
      expect(screen.getAllByText(/Error: Network timeout/).length).not.toBe(0),
    );
  });
});

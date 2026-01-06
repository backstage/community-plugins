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
import { screen, waitFor } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { useCatalogEntities } from './useCatalogEntities';

const mockCatalogApi = catalogApiMock.mock();

/**
 * A test component that uses the useCatalogEntities hook.
 */
const TestComponent = ({
  refs,
  searchTerm = '',
  kind,
}: {
  refs: string[] | undefined;
  searchTerm?: string;
  kind?: string;
}) => {
  const { entities, totalItems, loading, error } = useCatalogEntities(
    refs,
    searchTerm,
    kind,
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="entities-count">{entities.length}</div>
      {entities.map(entity => (
        <div key={entity.metadata.name} data-testid="entity">
          {entity.metadata.name}
        </div>
      ))}
    </div>
  );
};

const renderTestComponent = (props: {
  refs: string[] | undefined;
  searchTerm?: string;
  kind?: string;
}) => {
  return renderInTestApp(
    <TestApiProvider apis={[[catalogApiRef, mockCatalogApi]]}>
      <TestComponent {...props} />
    </TestApiProvider>,
  );
};

describe('useCatalogEntities', () => {
  describe('when refs is undefined', () => {
    it('should return empty results without making API call', async () => {
      renderTestComponent({ refs: undefined });

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('0');
        expect(screen.getByTestId('entities-count')).toHaveTextContent('0');
      });

      expect(mockCatalogApi.getEntitiesByRefs).not.toHaveBeenCalled();
    });
  });

  describe('when refs is empty array', () => {
    it('should return empty results without making API call', async () => {
      renderTestComponent({ refs: [] });

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('0');
        expect(screen.getByTestId('entities-count')).toHaveTextContent('0');
      });

      expect(mockCatalogApi.getEntitiesByRefs).not.toHaveBeenCalled();
    });
  });

  describe('when refs is an array of refs', () => {
    const mockEntity1 = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: 'team-one', namespace: 'default' },
    };

    const mockEntity2 = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: 'team-two' },
    };

    it('should return the entities for the refs', async () => {
      mockCatalogApi.getEntitiesByRefs.mockResolvedValue({
        items: [mockEntity1, mockEntity2],
      });

      await renderTestComponent({
        refs: ['group:default/team-one', 'group:default/team-two'],
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('2');
        expect(screen.getByTestId('entities-count')).toHaveTextContent('2');
        expect(screen.getByText('team-one')).toBeInTheDocument();
        expect(screen.getByText('team-two')).toBeInTheDocument();
      });
    });
  });
});

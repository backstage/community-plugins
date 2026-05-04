/*
 * Copyright 2021 The Backstage Authors
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

import { getFilteredEntities } from './catalogEntityFilter';
import { CatalogClient } from '@backstage/catalog-client';
import { mockServices } from '@backstage/backend-test-utils';
import { FilterPredicate } from '@backstage/filter-predicates';

jest.mock('@backstage/catalog-client');

const MockedCatalogClient = CatalogClient as jest.MockedClass<
  typeof CatalogClient
>;

describe('getFilteredEntities', () => {
  const discovery = {
    getBaseUrl: jest.fn().mockResolvedValue('http://localhost'),
    getExternalBaseUrl: jest.fn().mockResolvedValue('http://localhost'),
  };
  const auth = mockServices.auth();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getEntities with legacy array filter', async () => {
    const mockGetEntities = jest.fn().mockResolvedValue({ items: [] });
    MockedCatalogClient.prototype.getEntities = mockGetEntities;

    const legacyFilter = [{ kind: ['component', 'api'] }];
    await getFilteredEntities({
      discovery,
      auth,
      entityFilter: legacyFilter,
    });

    expect(mockGetEntities).toHaveBeenCalledWith(
      { filter: legacyFilter },
      expect.objectContaining({ token: expect.any(String) }),
    );
  });

  it('calls getEntities with legacy object filter containing symbols', async () => {
    const mockGetEntities = jest.fn().mockResolvedValue({ items: [] });
    MockedCatalogClient.prototype.getEntities = mockGetEntities;

    const CATALOG_FILTER_EXISTS = Symbol.for('CATALOG_FILTER_EXISTS');
    const legacyFilter = {
      kind: 'component',
      'spec.owner': CATALOG_FILTER_EXISTS,
    };
    await getFilteredEntities({
      discovery,
      auth,
      entityFilter: legacyFilter,
    });

    expect(mockGetEntities).toHaveBeenCalledWith(
      { filter: legacyFilter },
      expect.objectContaining({ token: expect.any(String) }),
    );
  });

  it('calls queryEntities with FilterPredicate using $all operator', async () => {
    const mockQueryEntities = jest.fn().mockResolvedValue({
      items: [{ metadata: { name: 'a' }, kind: 'Component' }],
      totalItems: 1,
      pageInfo: {},
    });
    MockedCatalogClient.prototype.queryEntities = mockQueryEntities;

    const predicate: FilterPredicate = {
      $all: [{ kind: 'component' }, { 'spec.type': 'service' }],
    };
    const result = await getFilteredEntities({
      discovery,
      auth,
      entityFilter: predicate,
    });

    expect(mockQueryEntities).toHaveBeenCalledWith(
      { query: predicate },
      expect.objectContaining({ token: expect.any(String) }),
    );
    expect(result).toHaveLength(1);
  });

  it('calls queryEntities with FilterPredicate using $in value matcher', async () => {
    const mockQueryEntities = jest.fn().mockResolvedValue({
      items: [],
      totalItems: 0,
      pageInfo: {},
    });
    MockedCatalogClient.prototype.queryEntities = mockQueryEntities;

    const predicate = {
      kind: 'component',
      'spec.type': { $in: ['service', 'website'] },
    };
    await getFilteredEntities({
      discovery,
      auth,
      entityFilter: predicate,
    });

    expect(mockQueryEntities).toHaveBeenCalledWith(
      { query: predicate },
      expect.objectContaining({ token: expect.any(String) }),
    );
  });

  it('paginates through multiple pages with queryEntities', async () => {
    const page1 = [{ metadata: { name: 'a' }, kind: 'Component' }];
    const page2 = [{ metadata: { name: 'b' }, kind: 'Component' }];

    const mockQueryEntities = jest
      .fn()
      .mockResolvedValueOnce({
        items: page1,
        totalItems: 2,
        pageInfo: { nextCursor: 'cursor-1' },
      })
      .mockResolvedValueOnce({
        items: page2,
        totalItems: 2,
        pageInfo: {},
      });
    MockedCatalogClient.prototype.queryEntities = mockQueryEntities;

    const predicate = { kind: 'component' };
    const result = await getFilteredEntities({
      discovery,
      auth,
      entityFilter: predicate,
    });

    expect(mockQueryEntities).toHaveBeenCalledTimes(2);
    expect(mockQueryEntities).toHaveBeenNthCalledWith(
      1,
      { query: predicate },
      expect.objectContaining({ token: expect.any(String) }),
    );
    expect(mockQueryEntities).toHaveBeenNthCalledWith(
      2,
      { cursor: 'cursor-1' },
      expect.objectContaining({ token: expect.any(String) }),
    );
    expect(result).toHaveLength(2);
  });

  it('calls getEntities with no filter when entityFilter is undefined', async () => {
    const mockGetEntities = jest.fn().mockResolvedValue({ items: [] });
    MockedCatalogClient.prototype.getEntities = mockGetEntities;

    await getFilteredEntities({
      discovery,
      auth,
      entityFilter: undefined,
    });

    expect(mockGetEntities).toHaveBeenCalledWith(
      { filter: undefined },
      expect.objectContaining({ token: expect.any(String) }),
    );
  });

  it('routes primitive FilterPredicate values through queryEntities', async () => {
    const mockQueryEntities = jest.fn().mockResolvedValue({
      items: [],
      totalItems: 0,
      pageInfo: {},
    });
    MockedCatalogClient.prototype.queryEntities = mockQueryEntities;

    await getFilteredEntities({
      discovery,
      auth,
      entityFilter: 'component',
    });

    expect(mockQueryEntities).toHaveBeenCalledWith(
      { query: 'component' },
      expect.objectContaining({ token: expect.any(String) }),
    );
  });
});

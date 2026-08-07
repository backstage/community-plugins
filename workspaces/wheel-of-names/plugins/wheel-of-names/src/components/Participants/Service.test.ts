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
import { EntityService } from './Service';

describe('EntityService', () => {
  let mockCatalogApi: any;
  let service: EntityService;

  beforeEach(() => {
    mockCatalogApi = {
      queryEntities: jest.fn(),
      getEntities: jest.fn(),
    };
    service = new EntityService(mockCatalogApi);
  });

  describe('fetchEntities', () => {
    it('should fetch entities without search term', async () => {
      const mockResponse = {
        items: [
          {
            kind: 'User',
            metadata: { uid: '1', name: 'user1' },
            spec: { profile: { displayName: 'User One' } },
          },
        ],
        totalItems: 1,
      };
      mockCatalogApi.queryEntities.mockResolvedValue(mockResponse);

      const result = await service.fetchEntities('', 10, 0);

      expect(mockCatalogApi.queryEntities).toHaveBeenCalledWith({
        filter: [{ kind: 'group' }, { kind: 'user' }],
        limit: 20,
        offset: 0,
        orderFields: { field: 'metadata.name', order: 'asc' },
      });
      expect(result).toEqual({ items: mockResponse.items, totalItems: 1 });
    });

    it('should fetch entities with single word search term', async () => {
      const mockResponse = {
        items: [
          {
            kind: 'User',
            metadata: { uid: '1', name: 'user1' },
            spec: { profile: { displayName: 'User One' } },
          },
        ],
        totalItems: 1,
      };
      mockCatalogApi.queryEntities.mockResolvedValue(mockResponse);

      const result = await service.fetchEntities('User', 10, 0);

      expect(mockCatalogApi.queryEntities).toHaveBeenCalledWith({
        filter: [{ kind: 'group' }, { kind: 'user' }],
        limit: 20,
        offset: 0,
        orderFields: { field: 'metadata.name', order: 'asc' },
        fullTextFilter: {
          term: 'User',
          fields: [
            'metadata.name',
            'kind',
            'spec.profile.displayName',
            'metadata.title',
          ],
        },
      });
      expect(result).toEqual({ items: mockResponse.items, totalItems: 1 });
    });

    it('should fetch entities with two word search term and handle name permutation', async () => {
      const userEntity = {
        kind: 'User',
        metadata: { uid: '1', name: 'user1' },
        spec: { profile: { displayName: 'Wyler Patrick' } },
      };
      const mockResponse1 = {
        items: [], // No results for "Patrick Wyler"
        totalItems: 0,
      };
      const mockResponse2 = {
        items: [userEntity], // Results for "Wyler Patrick"
        totalItems: 1,
      };
      mockCatalogApi.queryEntities
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const result = await service.fetchEntities('Patrick Wyler', 10, 0);

      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(2);
      expect(mockCatalogApi.queryEntities).toHaveBeenNthCalledWith(1, {
        filter: [{ kind: 'group' }, { kind: 'user' }],
        limit: 20,
        offset: 0,
        orderFields: { field: 'metadata.name', order: 'asc' },
        fullTextFilter: {
          term: 'Patrick Wyler',
          fields: [
            'metadata.name',
            'kind',
            'spec.profile.displayName',
            'metadata.title',
          ],
        },
      });
      expect(mockCatalogApi.queryEntities).toHaveBeenNthCalledWith(2, {
        filter: [{ kind: 'group' }, { kind: 'user' }],
        limit: 20,
        offset: 0,
        orderFields: { field: 'metadata.name', order: 'asc' },
        fullTextFilter: {
          term: 'Wyler Patrick',
          fields: [
            'metadata.name',
            'kind',
            'spec.profile.displayName',
            'metadata.title',
          ],
        },
      });
      expect(result).toEqual({ items: [userEntity], totalItems: 1 });
    });

    it('should deduplicate entities when both search terms return the same entity', async () => {
      const userEntity = {
        kind: 'User',
        metadata: { uid: '1', name: 'user1' },
        spec: { profile: { displayName: 'Wyler Patrick' } },
      };
      const mockResponse = {
        items: [userEntity],
        totalItems: 1,
      };
      mockCatalogApi.queryEntities.mockResolvedValue(mockResponse);

      const result = await service.fetchEntities('Wyler Patrick', 10, 0);

      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ items: [userEntity], totalItems: 1 });
    });

    it('should apply offset and limit correctly', async () => {
      const entities = [
        {
          kind: 'User',
          metadata: { uid: '1', name: 'user1' },
          spec: { profile: { displayName: 'User One' } },
        },
        {
          kind: 'User',
          metadata: { uid: '2', name: 'user2' },
          spec: { profile: { displayName: 'User Two' } },
        },
        {
          kind: 'User',
          metadata: { uid: '3', name: 'user3' },
          spec: { profile: { displayName: 'User Three' } },
        },
      ];
      mockCatalogApi.queryEntities.mockResolvedValue({
        items: entities,
        totalItems: 3,
      });

      const result = await service.fetchEntities('', 2, 1);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].metadata.uid).toBe('2');
      expect(result.items[1].metadata.uid).toBe('3');
      expect(result.totalItems).toBe(3);
    });
  });

  describe('fetchGroupMembers', () => {
    it('should fetch group members', async () => {
      const mockMembers = [
        {
          kind: 'User',
          metadata: { uid: '1', name: 'user1' },
        },
      ];
      mockCatalogApi.getEntities.mockResolvedValue({
        items: mockMembers,
      });

      const result = await service.fetchGroupMembers('teamx');

      expect(mockCatalogApi.getEntities).toHaveBeenCalledWith({
        filter: {
          kind: 'User',
          'relations.memberOf': ['group:default/teamx'],
        },
      });
      expect(result).toEqual(mockMembers);
    });
  });
});

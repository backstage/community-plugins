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
import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { wheelOfNamesPlugin, WheelOfNamesPage } from '../src/plugin';
import { TestApiProvider } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { Content, Header, Page } from '@backstage/core-components';

// Sample mock data
const mockUsers: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: 'john-doe',
      uid: 'user-1',
      title: 'John Doe',
    },
    spec: {
      profile: {
        displayName: 'John Doe',
        email: 'john@example.com',
      },
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: 'jane-smith',
      uid: 'user-2',
      title: 'Jane Smith',
    },
    spec: {
      profile: {
        displayName: 'Jane Smith',
        email: 'jane@example.com',
      },
    },
  },
];

// Add 20 more users for pagination tests
for (let i = 1; i <= 20; i++) {
  mockUsers.push({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: `user-${i + 2}`,
      uid: `user-${i + 2}`,
      title: `Test User ${i}`,
    },
    spec: {
      profile: {
        displayName: `Test User ${i}`,
        email: `user${i}@example.com`,
      },
    },
  });
}

const mockGroups: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'engineering',
      uid: 'group-1',
      title: 'Engineering Team',
    },
    spec: {
      type: 'team',
      profile: {
        displayName: 'Engineering Team',
      },
    },
    relations: [
      {
        type: 'hasMember',
        targetRef: 'user:default/john-doe',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/jane-smith',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/user-3',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/user-4',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/user-5',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/user-6',
      },
    ],
  },
];

// Create a mock catalog API
const mockCatalogApi = {
  getEntities: async ({
    filter,
  }: {
    filter?:
      | { kind?: string; 'relations.memberOf'?: string[] }
      | Array<{ kind: string }>;
  }) => {
    if (filter) {
      if (Array.isArray(filter)) {
        const kindFilters = filter.map(f => f.kind);
        const filteredEntities = [...mockUsers, ...mockGroups].filter(entity =>
          kindFilters.includes(entity.kind),
        );
        return { items: filteredEntities };
      }
      if (filter.kind === 'User' && filter['relations.memberOf']) {
        const groupRef = filter['relations.memberOf'][0];
        const groupName = groupRef.split('/')[1];

        // Return all members of the Engineering group
        if (groupName === 'engineering') {
          const memberRefs = mockGroups[0]
            .relations!.filter(rel => rel.type === 'hasMember')
            .map(rel => rel.targetRef);

          const memberNames = memberRefs.map(ref => ref.split('/')[1]);

          const groupMembers = mockUsers.filter(user =>
            memberNames.includes(user.metadata.name),
          );

          return { items: groupMembers };
        }
        return { items: [] };
      }
    }
    return { items: [...mockUsers, ...mockGroups] };
  },
  getEntityByRef: async (ref: any) => {
    const [kind, name] = ref.split(':')[1].split('/');
    const allEntities = [...mockUsers, ...mockGroups];
    return (
      allEntities.find(
        e =>
          e.kind.toLocaleLowerCase('en-US') === kind &&
          e.metadata.name === name,
      ) || undefined
    );
  },
  queryEntities: async (query: any) => {
    // All entities
    const allEntities = [...mockUsers, ...mockGroups];

    // Extract paging parameters
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    // Apply pagination
    const paginatedItems = allEntities.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      totalItems: allEntities.length, // Changed from totalCount to totalItems
      pageInfo: {
        limit,
        offset,
        nextCursor:
          offset + limit < allEntities.length
            ? String(offset + limit)
            : undefined,
      },
    };
  },
};

const app = createDevApp();

app.registerPlugin(wheelOfNamesPlugin);

// Wrap the page with API providers
app.addPage({
  element: (
    <Page themeId="home">
      <Header title="Wheel of Names" />
      <Content>
        <TestApiProvider apis={[[catalogApiRef, mockCatalogApi]]}>
          <WheelOfNamesPage />
        </TestApiProvider>
      </Content>
    </Page>
  ),
  title: 'Wheel of Names',
  path: '/wheel-of-names',
});

app.render();

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
    ],
  },
];
 
// Create a mock catalog API
const mockCatalogApi = {
  getEntities: async ({ filter }) => {
    // Simplified filtering logic for the mock
    if (filter) {
      if (Array.isArray(filter)) {
        // Handle array filter (used in fetchEntities)
        const kindFilters = filter.map(f => f.kind);
        const filteredEntities = [...mockUsers, ...mockGroups].filter(entity => 
          kindFilters.includes(entity.kind)
        );
        return { items: filteredEntities };
      } 
        // Handle object filter (used in fetchGroupMembers)
        if (filter.kind === 'User' && filter['relations.memberOf']) {
          // Mock group membership filtering
          const groupRef = filter['relations.memberOf'][0];
          const groupName = groupRef.split('/')[1];
          // Find users who are members of this group
          const groupMembers = mockUsers.filter(user => {
            // In real data, we'd check relations, but for mocking we'll just simulate
            if (groupName === 'engineering' && user.metadata.name === 'john-doe') {
              return true;
            }
            return false;
          });
          return { items: groupMembers };
        }
      
    }
    // Default: return all entities
    return { items: [...mockUsers, ...mockGroups] };
  },
  getEntityByRef: async (ref) => {
    const [kind, namespace, name] = ref.split(':')[1].split('/');
    const allEntities = [...mockUsers, ...mockGroups];
    return allEntities.find(e => e.kind.toLowerCase() === kind && e.metadata.name === name) || null;
  }
};
 
const app = createDevApp();
 
app.registerPlugin(wheelOfNamesPlugin);
 
// Wrap the page with API providers
app.addPage({
  element: (
    (
      <Page themeId="home">
        <Header title="Wheel of Names" />
        <Content>
          <TestApiProvider apis={[[catalogApiRef, mockCatalogApi]]}>
            <WheelOfNamesPage />
          </TestApiProvider>
        </Content>
      </Page>
    )
  ),
  title: 'Wheel of Names',
  path: '/wheel-of-names',
});
 
app.render();

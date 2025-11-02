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
import { renderHook, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { Entity } from '@backstage/catalog-model';
import { useUserRepositoriesAndTeam } from './useUserRepositoriesAndTeam';
import type { ReactNode } from 'react';

const mockTeamEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: {
    name: 'team-one',
    namespace: 'default',
    annotations: {
      'github.com/team-slug': 'test-org/team-one',
    },
  },
  spec: {
    type: 'team',
  },
};

const mockTeamTwoEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: {
    name: 'team-two',
    namespace: 'default',
    annotations: {
      'github.com/team-slug': 'test-org/team-two',
    },
  },
  spec: {
    type: 'team',
  },
};

const mockComponentEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'repo-one',
    namespace: 'default',
    annotations: {
      'github.com/project-slug': 'test-org/repo-one',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'group:default/team-one',
  },
  relations: [
    {
      type: 'ownedBy',
      targetRef: 'group:default/team-one',
    },
  ],
};

const mockUserEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: {
    name: 'user-one',
    namespace: 'default',
    annotations: {
      'github.com/user-login': 'user-one-github',
    },
  },
  spec: {
    profile: {
      displayName: 'User One',
    },
  },
  relations: [
    {
      type: 'memberOf',
      targetRef: 'group:default/team-one',
    },
  ],
};

const mockRepoTwoEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'repo-two',
    namespace: 'default',
    annotations: {
      'github.com/project-slug': 'test-org/repo-two',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'group:default/team-two',
  },
  relations: [
    {
      type: 'ownedBy',
      targetRef: 'group:default/team-two',
    },
  ],
};

const mockUserTwoEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: {
    name: 'user-two',
    namespace: 'default',
    annotations: {
      'github.com/user-login': 'user-two-github',
    },
  },
  spec: {
    profile: {
      displayName: 'User Two',
    },
  },
  relations: [
    {
      type: 'memberOf',
      targetRef: 'group:default/team-two',
    },
  ],
};

const catalogApi = catalogApiMock({
  entities: [
    mockTeamEntity,
    mockTeamTwoEntity,
    mockComponentEntity,
    mockRepoTwoEntity,
    mockUserEntity,
    mockUserTwoEntity,
  ],
});

describe('useUserRepositoriesAndTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
      {children}
    </TestApiProvider>
  );

  it('should return repositories and team members for a team entity', async () => {
    const { result } = renderHook(
      () => useUserRepositoriesAndTeam(mockTeamEntity),
      { wrapper },
    );

    // Initially should be loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repositories).toEqual(['test-org/repo-one']);
    expect(result.current.teamMembers).toEqual(['user-one-github']);
    expect(result.current.teamMembersOrganization).toBe('test-org');
  });

  it('should return repositories and team members for multiple team entities', async () => {
    const { result } = renderHook(
      () => useUserRepositoriesAndTeam([mockTeamEntity, mockTeamTwoEntity]),
      { wrapper },
    );

    // Initially should be loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should aggregate repositories and team members from both teams
    expect(result.current.repositories).toEqual([
      'test-org/repo-one',
      'test-org/repo-two',
    ]);
    expect(result.current.teamMembers).toEqual([
      'user-one-github',
      'user-two-github',
    ]);
    expect(result.current.teamMembersOrganization).toBe('test-org');
  });
});

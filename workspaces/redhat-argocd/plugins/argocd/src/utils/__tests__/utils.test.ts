/*
 * Copyright 2024 The Backstage Authors
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
import { mockApplication, mockEntity } from '../../../dev/__data__';
import {
  Application,
  History,
  Status,
} from '@backstage-community/plugin-redhat-argocd-common';
import {
  ArgoCdLabels,
  getAppOperationState,
  getAppSelector,
  getArgoCdAppConfig,
  getCommitUrl,
  getGitProvider,
  getInstanceName,
  getProjectName,
  getUniqueRevisions,
  getResourceCreateTimestamp,
  sortValues,
  removeDuplicateRevisions,
} from '../utils';

describe('Utils', () => {
  describe('getAppSelector', () => {
    test('should return an empty string if the app selector is not set', () => {
      expect(
        getAppSelector({
          ...mockEntity,
          metadata: {
            ...mockEntity.metadata,
            annotations: {},
          },
        }),
      ).toBe('');
    });

    test('should return the app selector string', () => {
      expect(getAppSelector(mockEntity)).toBe(
        'rht-gitops.com/janus-argocd=quarkus-app-bootstrap',
      );
    });
  });

  describe('getInstanceName', () => {
    test('should return an default instance if the instance name is not set', () => {
      expect(
        getInstanceName({
          ...mockEntity,
          metadata: {
            ...mockEntity.metadata,
            annotations: {},
          },
        }),
      ).toBe('');
    });

    test('should return the instance name', () => {
      expect(getInstanceName(mockEntity)).toBe('instance-1');
    });
  });

  describe('getProjectName', () => {
    test('should return undefined for project name', () => {
      expect(
        getProjectName({
          ...mockEntity,
          metadata: {
            ...mockEntity.metadata,
            annotations: {},
          },
        }),
      ).toBeUndefined();
    });

    test('should return the project name', () => {
      expect(getProjectName(mockEntity)).toBe('project-name');
    });
  });

  describe('getGitProvider', () => {
    test('should return unknown provider if the annotations are empty', () => {
      expect(getGitProvider({})).toBe('unknown');
      expect(getGitProvider(null as unknown as { [key: string]: string })).toBe(
        'unknown',
      );
    });

    test('should return gitlab if the url contain gitlab.com', () => {
      expect(
        getGitProvider({
          'test.com/source-url': 'https://gitlab.com/testrepo',
        }),
      ).toBe('gitlab');
    });

    test('should return github if the url contain github.com', () => {
      expect(
        getGitProvider({
          'test.com/source-url': 'https://github.com/testrepo',
        }),
      ).toBe('github');
    });

    test('should return gitlab based on the annotation key', () => {
      expect(
        getGitProvider({
          'gitlab.com/source-url': 'https://custom-gl-url.com/testrepo',
        }),
      ).toBe('gitlab');
    });

    test('should return github based on the annotation key', () => {
      expect(
        getGitProvider({
          'github.com/source-url': 'https://custom-gh-url.com/testrepo',
          'test-key': 'test-value',
        }),
      ).toBe('github');
    });

    test('should return unknown if annotation key and url does not contain known providers', () => {
      expect(
        getGitProvider({
          'bitbucket.com/source-url':
            'https://custom-bitbucket-url.com/testrepo',
          'test-key': 'test-value',
        }),
      ).toBe('unknown');
    });
  });

  describe('getCommitUrl', () => {
    test('should return correct gitlab commit url', () => {
      expect(
        getCommitUrl('https://custom-gl-url.com/testrepo', '12345', {
          'gitlab.com/source-url': 'https://custom-gl-url.com/testrepo',
        }),
      ).toBe('https://custom-gl-url.com/testrepo/-/commit/12345');
    });

    test('should return correct github commit url', () => {
      expect(
        getCommitUrl('https://custom-gh-url.com/testrepo', '12345', {
          'github.com/source-url': 'https://custom-gl-url.com/testrepo',
        }),
      ).toBe('https://custom-gh-url.com/testrepo/commit/12345');
    });

    test('should return the repo url for unknown provider', () => {
      expect(
        getCommitUrl('https://custom-gh-url.com/testrepo', '12345', {
          'bitbucket.com/source-url': 'https://custom-bb-url.com/testrepo',
        }),
      ).toBe('https://custom-gh-url.com/testrepo');
    });
  });

  describe('getAppOperationState', () => {
    test('should return Succeeded if the operationState object is present', () => {
      expect(getAppOperationState(mockApplication).phase).toBe('Succeeded');
    });

    test('should return Running if the application has operation object outside', () => {
      expect(
        getAppOperationState({
          ...mockApplication,
          operation: {
            ...mockApplication.status.operationState.operation,
          },
        }).phase,
      ).toBe('Running');
    });
    test('should return Running if the application is marked for deletion', () => {
      expect(
        getAppOperationState({
          ...mockApplication,
          metadata: {
            ...mockApplication.metadata,
            deletionTimestamp: new Date(),
          },
        }).phase,
      ).toBe('Running');
    });
  });

  describe('getUniqueRevisions', () => {
    test('should return empty array for invalid values', () => {
      expect(getUniqueRevisions([])).toHaveLength(0);

      expect(getUniqueRevisions(null as unknown as Application[])).toHaveLength(
        0,
      );

      expect(
        getUniqueRevisions([
          {
            ...mockApplication,
            status: undefined as unknown as Status,
          },
        ]),
      ).toHaveLength(0);
    });

    test('should return unique revision', () => {
      expect(getUniqueRevisions([mockApplication])).toHaveLength(1);
    });

    test('should return unique revision for multiple applications', () => {
      const mockApplicationTwo: Application = {
        ...mockApplication,
        status: {
          ...mockApplication.status,
          history: [
            {
              ...(mockApplication?.status?.history?.[0] as History),
              revision: '12345',
            },
            {
              ...(mockApplication?.status?.history?.[1] as History),
              revision: '12345',
            },
          ],
        },
      };
      expect(getUniqueRevisions([mockApplication, mockApplicationTwo])).toEqual(
        ['90f9758b7033a4bbb7c33a35ee474d61091644bc', '12345'],
      );
    });
  });
  describe('getArgoCdAppConfig', () => {
    test('should throw error if both the annotations are missing', () => {
      expect(() =>
        getArgoCdAppConfig({
          entity: {
            ...mockEntity,
            metadata: {
              ...mockEntity.metadata,
              annotations: {},
            },
          },
        }),
      ).toThrow('Argo CD annotation is missing in the catalog');
    });

    test('should throw error if both the annotations are set', () => {
      expect(() =>
        getArgoCdAppConfig({
          entity: {
            ...mockEntity,
            metadata: {
              ...mockEntity.metadata,
              annotations: {
                [ArgoCdLabels.appSelector]: 'janus-idp/quarkus-app',
                [ArgoCdLabels.appName]: 'quarkus-app',
              },
            },
          },
        }),
      ).toThrow(
        `Cannot provide both ${ArgoCdLabels.appName} and ${ArgoCdLabels.appSelector} annotations`,
      );
    });

    test('should return argocd configuration object when one of the annotations is set', () => {
      const configuration = getArgoCdAppConfig({ entity: mockEntity });

      expect(configuration).toStrictEqual({
        appName: '',
        appNamespace: '',
        appSelector: 'rht-gitops.com%2Fjanus-argocd%3Dquarkus-app-bootstrap',
        projectName: 'project-name',
        url: '/argocd/api',
      });
    });
  });

  describe('getResourceCreateTimestamp', () => {
    const argoResources = {
      pods: [],
      replicasets: [],
      rollouts: [],
      analysisruns: [],
      deployments: [
        {
          metadata: {
            name: 'quarkus-app',
            namespace: 'openshift-gitops',
            creationTimestamp: '2024-09-01T12:00:00Z',
          },
        },
        {
          metadata: {
            name: 'another-app',
            namespace: 'another-namespace',
            creationTimestamp: '2024-09-02T12:00:00Z',
          },
        },
      ],
    };

    const targetResource = {
      version: 'v1',
      kind: 'Deployment',
      namespace: 'openshift-gitops',
      name: 'quarkus-app',
      status: 'Synced',
      health: { status: 'Healthy' },
    };

    it('should return the correct creation timestamp when the resource is found', () => {
      const timestamp = getResourceCreateTimestamp(
        argoResources,
        targetResource,
      );
      expect(timestamp).toBe('2024-09-01T12:00:00Z');
    });

    it('should return null if the resource kind is not found in argoResources', () => {
      const noKindResources = {
        ...argoResources,
        services: [], // No services
      };

      const serviceTarget = {
        version: 'v1',
        kind: 'Service',
        namespace: 'openshift-gitops',
        name: 'my-service',
        status: 'Synced',
        health: { status: 'Healthy' },
      };

      const timestamp = getResourceCreateTimestamp(
        noKindResources,
        serviceTarget,
      );
      expect(timestamp).toBeNull();
    });

    it('should return null if the resource is not found within the kind', () => {
      const notFoundResource = {
        version: 'v1',
        kind: 'Deployment',
        namespace: 'openshift-gitops',
        name: 'non-existent-app',
        status: 'Synced',
        health: { status: 'Healthy' },
      };

      const timestamp = getResourceCreateTimestamp(
        argoResources,
        notFoundResource,
      );
      expect(timestamp).toBeNull();
    });

    it('should return null if resource metadata is missing a creationTimestamp', () => {
      const missingTimestampResources = {
        pods: [],
        replicasets: [],
        rollouts: [],
        analysisruns: [],
        deployments: [
          {
            metadata: {
              name: 'quarkus-app',
              namespace: 'openshift-gitops',
            },
          },
        ],
      };

      const timestamp = getResourceCreateTimestamp(
        missingTimestampResources,
        targetResource,
      );
      expect(timestamp).toBeNull();
    });
  });

  describe('sortValues', () => {
    it('should return 0 if either value is undefined', () => {
      expect(sortValues(undefined, 1, 'asc')).toBe(0);
      expect(sortValues(1, undefined, 'asc')).toBe(0);
      expect(sortValues(undefined, undefined, 'asc')).toBe(0);
    });

    it('should sort date values correctly in ascending order', () => {
      expect(
        sortValues('2024-08-28T04:00:39Z', '2023-08-28T04:00:39Z', 'asc'),
      ).toBeGreaterThan(0);
      expect(
        sortValues('2024-07-28T04:00:39Z', '2024-08-28T04:00:39Z', 'asc'),
      ).toBeLessThan(0);
      expect(
        sortValues('2024-08-28T04:00:39Z', '2024-08-28T04:00:39Z', 'asc'),
      ).toBe(0);
    });

    it('should sort date values correctly in descending order', () => {
      expect(
        sortValues('2024-08-28T04:00:39Z', '2024-08-22T04:00:39Z', 'desc'),
      ).toBeLessThan(0);
      expect(
        sortValues('2023-08-28T04:00:39Z', '2024-08-28T04:00:39Z', 'desc'),
      ).toBeGreaterThan(0);
      expect(
        sortValues('2024-08-28T04:00:39Z', '2024-08-28T04:00:39Z', 'desc'),
      ).toBe(0);
    });

    it('should sort numeric values correctly in ascending order', () => {
      expect(sortValues(10, 5, 'asc')).toBeGreaterThan(0);
      expect(sortValues(5, 10, 'asc')).toBeLessThan(0);
      expect(sortValues(10, 10, 'asc')).toBe(0);
    });

    it('should sort numeric values correctly in descending order', () => {
      expect(sortValues(10, 5, 'desc')).toBeLessThan(0);
      expect(sortValues(5, 10, 'desc')).toBeGreaterThan(0);
      expect(sortValues(10, 10, 'desc')).toBe(0);
    });

    it('should sort string values correctly in ascending order', () => {
      expect(sortValues('deployment', 'service', 'asc')).toBeLessThan(0);
      expect(sortValues('healthy', 'degraded', 'asc')).toBeGreaterThan(0);
      expect(sortValues('quarkus-app', 'quarkus-app', 'asc')).toBe(0);
    });

    it('should sort string values correctly in descending order', () => {
      expect(sortValues('deployment', 'service', 'desc')).toBeGreaterThan(0);
      expect(sortValues('healthy', 'degraded', 'desc')).toBeLessThan(0);
      expect(sortValues('quarkus-app', 'quarkus-app', 'desc')).toBe(0);
    });

    it('should return 0 if values are of unsupported types', () => {
      expect(sortValues({}, {}, 'asc')).toBe(0);
      expect(sortValues([], [], 'asc')).toBe(0);
      expect(sortValues(null, null, 'asc')).toBe(0);
    });
  });

  describe('removeDuplicateRevisions', () => {
    it('should return an empty array if nothing is passed', () => {
      expect(removeDuplicateRevisions([])).toEqual([]);
    });

    it('should remove commits with duplicate entries', () => {
      const date =
        'Fri Feb 28 2025 21:11:22 GMT+0000 (Coordinated Universal Time)';
      const duplicateRevisions = [
        {
          author: 'user-a',
          date: date,
          message: 'commit sent to repo',
          revisionID: 'abc123',
        },
        {
          author: 'user-a',
          date: date,
          message: 'commit sent to repo',
          revisionID: 'abc123',
        },
        {
          author: 'user-a',
          date: date,
          message: 'commit sent to repo',
          revisionID: 'abc123',
        },
        {
          author: 'user-b',
          date: date,
          message: 'fixes bug issue',
          revisionID: 'def456',
        },
      ];

      expect(removeDuplicateRevisions(duplicateRevisions as any)).toEqual([
        {
          author: 'user-a',
          date: date,
          message: 'commit sent to repo',
          revisionID: 'abc123',
        },
        {
          author: 'user-b',
          date: date,
          message: 'fixes bug issue',
          revisionID: 'def456',
        },
      ]);
    });
  });
});

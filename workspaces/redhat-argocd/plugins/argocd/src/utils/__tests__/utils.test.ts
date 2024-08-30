import { mockApplication, mockEntity } from '../../../dev/__data__';
import { Application, History, Status } from '../../types';
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
});

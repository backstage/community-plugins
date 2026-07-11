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

import { Entity } from '@backstage/catalog-model';
import { getAnnotationValuesFromEntity } from './getAnnotationValuesFromEntity';

describe('getAnnotationValuesFromEntity', () => {
  describe('without any annotations', () => {
    it('should throw annotations not found', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
        },
      };
      expect(() => getAnnotationValuesFromEntity(entity)).toThrow(
        'Expected "dev.azure.com" annotations were not found',
      );
    });
  });

  describe('with valid project-repo annotation', () => {
    it('should return project and repo', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': 'projectName/repoName',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: 'repoName',
        definition: undefined,
        readmePath: undefined,
        host: undefined,
        org: undefined,
      });
    });
  });

  describe('with invalid project-repo annotation', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': 'project',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/project-repo"; expected format is: <project-name>/<repo-name>, found: "project"',
      );
    });
  });

  describe('with project-repo annotation missing project', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': '/repo',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/project-repo"; expected format is: <project-name>/<repo-name>, found: "/repo"',
      );
    });
  });

  describe('with project-repo annotation missing repo', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': 'project/',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/project-repo"; expected format is: <project-name>/<repo-name>, found: "project/"',
      );
    });
  });

  describe('with valid project and build-definition annotations', () => {
    it('should return project and definition', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-build-definition',
          annotations: {
            'dev.azure.com/project': 'projectName',
            'dev.azure.com/build-definition': 'buildDefinitionName',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: undefined,
        definition: 'buildDefinitionName',
        readmePath: undefined,
        host: undefined,
        org: undefined,
      });
    });
  });

  describe('with only project annotation', () => {
    it('should throw annotation not found error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project',
          annotations: {
            'dev.azure.com/project': 'projectName',
          },
        },
      };
      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Value for annotation "dev.azure.com/build-definition" was not found',
      );
    });
  });

  describe('with only build-definition annotation', () => {
    it('should throw annotation not found error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'build-definition',
          annotations: {
            'dev.azure.com/build-definition': 'buildDefinitionName',
          },
        },
      };
      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Value for annotation "dev.azure.com/project" was not found',
      );
    });
  });

  describe('with valid project-repo and host-org annotations', () => {
    it('should return project, repo, host, and org', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': 'projectName/repoName',
            'dev.azure.com/host-org': 'hostName/organizationName',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: 'repoName',
        definition: undefined,
        readmePath: undefined,
        host: 'hostName',
        org: 'organizationName',
      });
    });
  });

  describe('with valid project, build-definition, and host-org annotations', () => {
    it('should return project, definition, host and org', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-build-definition',
          annotations: {
            'dev.azure.com/project': 'projectName',
            'dev.azure.com/build-definition': 'buildDefinitionName',
            'dev.azure.com/host-org': 'hostName/organizationName',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: undefined,
        definition: 'buildDefinitionName',
        readmePath: undefined,
        host: 'hostName',
        org: 'organizationName',
      });
    });
  });

  describe('with invalid host-org annotation', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'host-org',
          annotations: {
            'dev.azure.com/host-org': 'host',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/host-org"; expected format is: <host-name>/<organization-name>, found: "host"',
      );
    });
  });

  describe('with host-org annotation missing host', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'host-org',
          annotations: {
            'dev.azure.com/host-org': '/org',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/host-org"; expected format is: <host-name>/<organization-name>, found: "/org"',
      );
    });
  });

  describe('with host-org annotation missing org', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'host-org',
          annotations: {
            'dev.azure.com/host-org': 'host/',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/host-org"; expected format is: <host-name>/<organization-name>, found: "host/"',
      );
    });
  });

  describe('with tfs subpath for org', () => {
    it('should return host and org', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'tfs-subpath',
          annotations: {
            'dev.azure.com/project-repo': 'projectName/repoName',
            'dev.azure.com/host-org': 'company.com/tfs/organizationName',
          },
        },
      };

      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: 'repoName',
        definition: undefined,
        readmePath: undefined,
        host: 'company.com/tfs',
        org: 'organizationName',
      });
    });
  });

  describe('host-org with more then expected slashes', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'host-org',
          annotations: {
            'dev.azure.com/host-org': 'host/subpath/another-path/org/project',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/host-org"; expected format is: <host-name>/<organization-name>, found: "host/subpath/another-path/org/project"',
      );
    });
  });

  describe('project-repo with more then expected slashes', () => {
    it('should throw incorrect format error', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': 'project/another/repo/final',
          },
        },
      };

      const test = () => {
        return getAnnotationValuesFromEntity(entity);
      };

      expect(test).toThrow(
        'Invalid value for annotation "dev.azure.com/project-repo"; expected format is: <project-name>/<repo-name>, found: "project/another/repo/final"',
      );
    });
  });

  describe('projectRepo and buildDefinition are provided', () => {
    it('should return project, repo and buildDefinition', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/build-definition': 'buildDefinitionName',
            'dev.azure.com/project-repo': 'projectName/repoName',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: 'repoName',
        definition: 'buildDefinitionName',
        readmePath: undefined,
        host: undefined,
        org: undefined,
      });
    });
  });

  describe('project, projectRepo and buildDefinition are provided', () => {
    it('should prefer project over project-repo.project and return no repo', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project': 'projectName',
            'dev.azure.com/build-definition': 'buildDefinitionName',
            'dev.azure.com/project-repo': 'ignoredProject/repoName',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: undefined,
        definition: 'buildDefinitionName',
        readmePath: undefined,
        host: undefined,
        org: undefined,
      });
    });
  });

  describe('definition, project and readme', () => {
    it('returns with the readme path', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project': 'projectName',
            'dev.azure.com/build-definition': 'buildDefinitionName',
            'dev.azure.com/readme-path': 'readme/path.md',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: undefined,
        definition: 'buildDefinitionName',
        readmePath: 'readme/path.md',
        host: undefined,
        org: undefined,
      });
    });
  });

  describe('definition, projectRepo and readme', () => {
    it('returns with the readme path', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': 'projectName/repoName',
            'dev.azure.com/build-definition': 'buildDefinitionName',
            'dev.azure.com/readme-path': 'readme/path.md',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: 'repoName',
        definition: 'buildDefinitionName',
        readmePath: 'readme/path.md',
        host: undefined,
        org: undefined,
      });
    });
  });

  describe('projectRepo and readme', () => {
    it('returns with the readme path', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          namespace: 'default',
          name: 'project-repo',
          annotations: {
            'dev.azure.com/project-repo': 'projectName/repoName',
            'dev.azure.com/readme-path': 'readme/path.md',
          },
        },
      };
      const values = getAnnotationValuesFromEntity(entity);
      expect(values).toEqual({
        project: 'projectName',
        repo: 'repoName',
        definition: undefined,
        readmePath: 'readme/path.md',
        host: undefined,
        org: undefined,
      });
    });
  });
  describe('readme path auto-detection from managed-by-location (#9188)', () => {
    it('returns explicit readme-path annotation when both annotations are present', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'dev.azure.com/readme-path': '/explicit/README.md',
            'backstage.io/managed-by-location':
              'url:https://dev.azure.com/org/proj/_git/repo?path=%2Fsvc%2Fcatalog-info.yaml',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBe('/explicit/README.md');
    });

    it('derives readme path when managed-by-location points to a catalog file', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location':
              'url:https://dev.azure.com/org/proj/_git/repo?path=%2Fservices%2Fmy-svc%2Fcatalog-info.yaml',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBe('/services/my-svc/README.md');
    });

    it('derives readme path when managed-by-location path has a trailing slash', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location':
              'url:https://dev.azure.com/org/proj/_git/repo?path=%2Fservices%2Fmy-svc%2Fcatalog-info.yaml%2F',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBe('/services/my-svc/README.md');
    });

    it('derives readme path at repo root when managed-by-location has no subdirectory', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location':
              'url:https://dev.azure.com/org/proj/_git/repo?path=%2Fcatalog-info.yaml',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBe('/README.md');
    });

    it('returns undefined when neither readme-path nor managed-by-location annotation is present', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBeUndefined();
    });

    it('returns undefined when managed-by-location URL has no path query parameter (e.g. GitHub-style URLs)', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location':
              'url:https://github.com/org/repo/blob/main/catalog-info.yaml',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBeUndefined();
    });

    it('returns undefined for non-Azure DevOps URLs even when they have a path query parameter', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location':
              'url:https://github.com/org/repo?path=%2Fservices%2Fmy-svc%2Fcatalog-info.yaml',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBeUndefined();
    });

    it('returns empty string when the explicit readme-path annotation is an empty string', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'dev.azure.com/readme-path': '',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBe('');
    });

    it('derives readme path for on-prem Azure DevOps Server URLs (non dev.azure.com hostname)', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location':
              'url:https://azuredevops.mycompany.com/org/proj/_git/repo?path=%2Fservices%2Fmy-svc%2Fcatalog-info.yaml',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBe('/services/my-svc/README.md');
    });

    it('returns undefined when managed-by-location Azure DevOps URL has no path query parameter', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location':
              'url:https://dev.azure.com/org/proj/_git/repo',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBeUndefined();
    });

    it('returns undefined gracefully when managed-by-location is a malformed URL', () => {
      const entity = {
        metadata: {
          annotations: {
            'dev.azure.com/project-repo': 'myproject/myrepo',
            'backstage.io/managed-by-location': 'not-a-valid-url',
          },
        },
      } as unknown as Entity;

      const result = getAnnotationValuesFromEntity(entity);
      expect(result.readmePath).toBeUndefined();
    });
  });
});

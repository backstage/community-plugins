/*
 * Copyright 2026 The Backstage Authors
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
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { Entity } from '@backstage/catalog-model';
import { ConflictError, InputError, NotFoundError } from '@backstage/errors';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

import { NpmRegistryPackageInfo } from '@backstage-community/plugin-npm-common';

import { NpmRegistryService } from '../services';
import { createGetPackageInfoAction } from './createGetPackageInfoAction';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-package',
    namespace: 'default',
    annotations: {
      'npm/package': '@internal/my-package',
      'npm/show-tags': 'latest, next',
    },
  },
  spec: { type: 'library' },
};

const entityWithStableTag: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-stable-package',
    namespace: 'team-a',
    annotations: {
      'npm/package': '@internal/my-package',
      'npm/stable-tag': 'stable',
    },
  },
  spec: { type: 'library' },
};

const entityWithoutPackage: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'no-package', namespace: 'default' },
  spec: { type: 'library' },
};

// Same name as `entity`, but a different kind
const apiWithSameName: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'API',
  metadata: {
    name: 'my-package',
    namespace: 'default',
    annotations: { 'npm/package': '@internal/my-package-api' },
  },
  spec: { type: 'openapi' },
};

const packageInfo: NpmRegistryPackageInfo = {
  _id: '@internal/my-package',
  _rev: '1',
  name: '@internal/my-package',
  description: 'A test package',
  keywords: ['backstage', 'test'],
  license: 'Apache-2.0',
  homepage: 'https://example.com',
  repository: { type: 'git', url: 'https://github.com/example/my-package' },
  bugs: { url: 'https://github.com/example/my-package/issues' },
  'dist-tags': {
    latest: '1.2.0',
    next: '1.3.0-next.0',
    stable: '1.1.0',
    legacy: '0.9.0',
  },
  versions: {},
  time: {
    created: '2024-01-01T00:00:00.000Z',
    modified: '2024-04-01T00:00:00.000Z',
    '0.9.0': '2024-01-01T00:00:00.000Z',
    '1.1.0': '2024-02-01T00:00:00.000Z',
    '1.2.0': '2024-03-01T00:00:00.000Z',
    '1.3.0-next.0': '2024-04-01T00:00:00.000Z',
  },
};

describe('createGetPackageInfoAction', () => {
  const actionsRegistry = { register: jest.fn() };
  const npmRegistryService: jest.Mocked<NpmRegistryService> = {
    getPackageInfo: jest.fn(),
    getPackageInfoForEntity: jest.fn(),
  };
  const catalog = catalogServiceMock({
    entities: [
      entity,
      entityWithStableTag,
      entityWithoutPackage,
      apiWithSameName,
    ],
  });
  const credentials = mockCredentials.user();
  const logger = mockServices.logger.mock();

  beforeEach(() => {
    jest.clearAllMocks();
    npmRegistryService.getPackageInfoForEntity.mockResolvedValue(packageInfo);
    createGetPackageInfoAction({
      actionsRegistry: actionsRegistry as any,
      catalog,
      npmRegistryService,
    });
  });

  it('registers a read-only get-package-info action', () => {
    expect(actionsRegistry.register).toHaveBeenCalledTimes(1);
    const registration = actionsRegistry.register.mock.calls[0][0];
    expect(registration.name).toBe('get-package-info');
    expect(registration.attributes).toEqual({
      readOnly: true,
      destructive: false,
      idempotent: true,
    });
  });

  it('returns the package info, the latest version and the filtered tags', async () => {
    const registration = actionsRegistry.register.mock.calls[0][0];

    const result = await registration.action({
      input: { name: 'my-package', kind: 'Component' },
      credentials,
      logger,
    });

    expect(npmRegistryService.getPackageInfoForEntity).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: entity.metadata }),
    );
    expect(result.output).toEqual({
      packageName: '@internal/my-package',
      description: 'A test package',
      license: 'Apache-2.0',
      keywords: ['backstage', 'test'],
      homepage: 'https://example.com',
      repository: 'https://github.com/example/my-package',
      bugs: 'https://github.com/example/my-package/issues',
      latestTag: 'latest',
      latestVersion: '1.2.0',
      latestPublishedAt: '2024-03-01T00:00:00.000Z',
      tags: [
        {
          tag: 'latest',
          version: '1.2.0',
          publishedAt: '2024-03-01T00:00:00.000Z',
        },
        {
          tag: 'next',
          version: '1.3.0-next.0',
          publishedAt: '2024-04-01T00:00:00.000Z',
        },
      ],
    });
  });

  it('resolves the entity by name only and respects the stable-tag annotation', async () => {
    const registration = actionsRegistry.register.mock.calls[0][0];

    // kind and namespace are omitted, the entity is unique by name
    const result = await registration.action({
      input: { name: 'my-stable-package' },
      credentials,
      logger,
    });

    expect(npmRegistryService.getPackageInfoForEntity).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: entityWithStableTag.metadata }),
    );

    expect(result.output).toMatchObject({
      latestTag: 'stable',
      latestVersion: '1.1.0',
      latestPublishedAt: '2024-02-01T00:00:00.000Z',
    });
    // no show-tags annotation, so all tags are returned
    expect(result.output.tags.map((t: { tag: string }) => t.tag)).toEqual([
      'latest',
      'next',
      'stable',
      'legacy',
    ]);
  });

  it('throws ConflictError when the name matches multiple entities', async () => {
    const registration = actionsRegistry.register.mock.calls[0][0];

    await expect(
      registration.action({
        input: { name: 'my-package' },
        credentials,
        logger,
      }),
    ).rejects.toThrow(
      new ConflictError(
        "Multiple entities found with name 'my-package', please provide a more specific kind and/or namespace. Matching entities: component:default/my-package, api:default/my-package",
      ),
    );
    expect(npmRegistryService.getPackageInfoForEntity).not.toHaveBeenCalled();
  });

  it('throws InputError for unknown entities and NotFoundError for entities without package annotation', async () => {
    const registration = actionsRegistry.register.mock.calls[0][0];

    await expect(
      registration.action({
        input: { name: 'unknown' },
        credentials,
        logger,
      }),
    ).rejects.toThrow(new InputError("No entity found with name 'unknown'"));

    // wrong namespace for an existing name
    await expect(
      registration.action({
        input: { name: 'my-stable-package', namespace: 'default' },
        credentials,
        logger,
      }),
    ).rejects.toThrow(InputError);

    await expect(
      registration.action({
        input: { name: 'no-package' },
        credentials,
        logger,
      }),
    ).rejects.toThrow(
      new NotFoundError(
        "Npm package name not defined at entity 'component:default/no-package'",
      ),
    );

    expect(npmRegistryService.getPackageInfoForEntity).not.toHaveBeenCalled();
  });
});

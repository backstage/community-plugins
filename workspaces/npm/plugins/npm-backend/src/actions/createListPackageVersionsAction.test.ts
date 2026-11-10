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
import { InputError } from '@backstage/errors';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

import { NpmRegistryPackageInfo } from '@backstage-community/plugin-npm-common';

import { NpmRegistryService } from '../services';
import { createListPackageVersionsAction } from './createListPackageVersionsAction';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-package',
    namespace: 'default',
    annotations: { 'npm/package': '@internal/my-package' },
  },
  spec: { type: 'library' },
};

const packageInfoWithTime: NpmRegistryPackageInfo = {
  _id: '@internal/my-package',
  _rev: '1',
  name: '@internal/my-package',
  'dist-tags': { latest: '1.2.0', next: '1.3.0-next.0' },
  versions: {},
  time: {
    created: '2024-01-01T00:00:00.000Z',
    modified: '2024-04-01T00:00:00.000Z',
    // intentionally not in publish order
    '1.2.0': '2024-03-01T00:00:00.000Z',
    '0.9.0': '2024-01-01T00:00:00.000Z',
    '1.3.0-next.0': '2024-04-01T00:00:00.000Z',
    '1.1.0': '2024-02-01T00:00:00.000Z',
  },
};

const version = (v: string) => ({
  name: '@internal/my-package',
  version: v,
  homepage: '',
  description: '',
});

const packageInfoWithoutTime: NpmRegistryPackageInfo = {
  _id: '@internal/my-package',
  _rev: '1',
  name: '@internal/my-package',
  'dist-tags': { latest: '1.1.0' },
  versions: {
    '0.9.0': version('0.9.0'),
    '1.0.0': version('1.0.0'),
    '1.1.0': version('1.1.0'),
  },
};

describe('createListPackageVersionsAction', () => {
  const actionsRegistry = { register: jest.fn() };
  const npmRegistryService: jest.Mocked<NpmRegistryService> = {
    getPackageInfo: jest.fn(),
    getPackageInfoForEntity: jest.fn(),
  };
  const catalog = catalogServiceMock({ entities: [entity] });
  const credentials = mockCredentials.user();
  const logger = mockServices.logger.mock();

  beforeEach(() => {
    jest.clearAllMocks();
    createListPackageVersionsAction({
      actionsRegistry: actionsRegistry as any,
      catalog,
      npmRegistryService,
    });
  });

  it('registers a read-only list-package-versions action', () => {
    expect(actionsRegistry.register).toHaveBeenCalledTimes(1);
    const registration = actionsRegistry.register.mock.calls[0][0];
    expect(registration.name).toBe('list-package-versions');
    expect(registration.attributes).toEqual({
      readOnly: true,
      destructive: false,
      idempotent: true,
    });
  });

  it('returns the versions newest first with release dates and tags, limited to n', async () => {
    npmRegistryService.getPackageInfoForEntity.mockResolvedValue(
      packageInfoWithTime,
    );
    const registration = actionsRegistry.register.mock.calls[0][0];

    const all = await registration.action({
      input: { name: 'my-package' },
      credentials,
      logger,
    });
    expect(all.output).toEqual({
      packageName: '@internal/my-package',
      total: 4,
      versions: [
        {
          version: '1.3.0-next.0',
          publishedAt: '2024-04-01T00:00:00.000Z',
          tags: ['next'],
        },
        {
          version: '1.2.0',
          publishedAt: '2024-03-01T00:00:00.000Z',
          tags: ['latest'],
        },
        { version: '1.1.0', publishedAt: '2024-02-01T00:00:00.000Z', tags: [] },
        { version: '0.9.0', publishedAt: '2024-01-01T00:00:00.000Z', tags: [] },
      ],
    });

    const limited = await registration.action({
      input: { name: 'my-package', limit: 2 },
      credentials,
      logger,
    });
    expect(limited.output.total).toBe(4);
    expect(
      limited.output.versions.map((v: { version: string }) => v.version),
    ).toEqual(['1.3.0-next.0', '1.2.0']);
  });

  it('falls back to the versions map when the registry provides no time information', async () => {
    npmRegistryService.getPackageInfoForEntity.mockResolvedValue(
      packageInfoWithoutTime,
    );
    const registration = actionsRegistry.register.mock.calls[0][0];

    const result = await registration.action({
      input: { name: 'my-package', limit: 2 },
      credentials,
      logger,
    });

    expect(result.output).toEqual({
      packageName: '@internal/my-package',
      total: 3,
      versions: [
        { version: '1.1.0', tags: ['latest'] },
        { version: '1.0.0', tags: [] },
      ],
    });
  });

  it('throws InputError for unknown entities', async () => {
    const registration = actionsRegistry.register.mock.calls[0][0];

    await expect(
      registration.action({
        input: { name: 'unknown', namespace: 'other' },
        credentials,
        logger,
      }),
    ).rejects.toThrow(InputError);
    expect(npmRegistryService.getPackageInfoForEntity).not.toHaveBeenCalled();
  });
});

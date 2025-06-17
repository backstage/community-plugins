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
import { mockServices } from '@backstage/backend-test-utils';
import {
  permissionDependentPluginStoreMock,
  pluginIdProviderMock,
} from '../../__fixtures__/mock-utils';
import { ExtendablePluginIdProvider } from './extendable-id-provider';
import { Config } from '@backstage/config';

describe('ExtendableIdProvider', () => {
  let config: Config;

  function createProvider(): ExtendablePluginIdProvider {
    return new ExtendablePluginIdProvider(
      permissionDependentPluginStoreMock,
      pluginIdProviderMock,
      config,
    );
  }

  beforeEach(() => {
    (
      permissionDependentPluginStoreMock.getPlugins as jest.Mock
    ).mockResolvedValueOnce([]);
    config = mockServices.rootConfig({
      data: {
        permission: {
          enabled: true,
          rbac: {
            pluginsWithPermission: ['argocd'],
          },
        },
      },
    });
  });

  it('should create an instance of ExtendableIdProvider', () => {
    const extendableIdProvider = createProvider();
    expect(extendableIdProvider).toBeInstanceOf(ExtendablePluginIdProvider);
  });

  it('should return plugin ids only from application config', async () => {
    const extendableIdProvider = createProvider();
    const pluginIds = await extendableIdProvider.getPluginIds();
    expect(pluginIds.length).toEqual(1);
    expect(pluginIds).toContain('argocd');
  });

  it('should merge plugin ids from application config and pluginIdProvider', async () => {
    pluginIdProviderMock.getPluginIds.mockReturnValueOnce(['jenkins']);

    const extendableIdProvider = createProvider();
    const pluginIds = await extendableIdProvider.getPluginIds();
    expect(pluginIds.length).toEqual(2);
    expect(pluginIds).toContain('argocd');
    expect(pluginIds).toContain('jenkins');
  });

  it('should merge plugin ids from application config, pluginIdProvider and db storage', async () => {
    (permissionDependentPluginStoreMock.getPlugins as jest.Mock).mockReset();
    (
      permissionDependentPluginStoreMock.getPlugins as jest.Mock
    ).mockResolvedValueOnce([{ pluginId: 'scaffolder' }]);
    pluginIdProviderMock.getPluginIds.mockReturnValueOnce(['jenkins']);

    const extendableIdProvider = createProvider();
    const pluginIds = await extendableIdProvider.getPluginIds();
    expect(pluginIds.length).toEqual(3);
    expect(pluginIds).toContain('argocd');
    expect(pluginIds).toContain('jenkins');
    expect(pluginIds).toContain('scaffolder');
  });

  it('should merge plugin ids from application config, pluginIdProvider and db storage without duplication', async () => {
    (permissionDependentPluginStoreMock.getPlugins as jest.Mock).mockReset();
    (
      permissionDependentPluginStoreMock.getPlugins as jest.Mock
    ).mockResolvedValueOnce([{ pluginId: 'jenkins' }]);
    pluginIdProviderMock.getPluginIds.mockReturnValueOnce(['jenkins']);

    const extendableIdProvider = createProvider();
    const pluginIds = await extendableIdProvider.getPluginIds();
    expect(pluginIds.length).toEqual(2);
    expect(pluginIds).toContain('argocd');
    expect(pluginIds).toContain('jenkins');
  });

  it('should detect if plugin id is configured', () => {
    (permissionDependentPluginStoreMock.getPlugins as jest.Mock).mockReset();
    (
      permissionDependentPluginStoreMock.getPlugins as jest.Mock
    ).mockResolvedValueOnce([{ pluginId: 'scaffolder' }]);
    pluginIdProviderMock.getPluginIds.mockReturnValueOnce(['jenkins']);

    const extendableIdProvider = createProvider();
    let isConfiguredPluginId =
      extendableIdProvider.isConfiguredPluginId('argocd');
    expect(isConfiguredPluginId).toBe(true);

    isConfiguredPluginId = extendableIdProvider.isConfiguredPluginId('jenkins');
    expect(isConfiguredPluginId).toBe(true);

    isConfiguredPluginId =
      extendableIdProvider.isConfiguredPluginId('scaffolder');
    expect(isConfiguredPluginId).toBe(false);
  });

  it('should remove conflicted plugin id, which came from database', async () => {
    (permissionDependentPluginStoreMock.getPlugins as jest.Mock).mockReset();
    (
      permissionDependentPluginStoreMock.getPlugins as jest.Mock
    ).mockResolvedValueOnce([{ pluginId: 'scaffolder' }]);
    pluginIdProviderMock.getPluginIds.mockReturnValueOnce([
      'jenkins',
      'scaffolder',
    ]);

    const extendableIdProvider = createProvider();
    await extendableIdProvider.handleConflictedPluginIds();
    expect(
      permissionDependentPluginStoreMock.deletePlugins,
    ).toHaveBeenCalledWith(['scaffolder']);
  });
});

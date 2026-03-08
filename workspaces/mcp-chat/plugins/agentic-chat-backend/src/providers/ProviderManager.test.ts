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

import { ProviderManager } from './ProviderManager';
import type { AgenticProvider } from './types';
import { createMockLogger } from '../test-utils/mocks';

type ProviderType = 'llamastack' | 'googleadk';

function createMockProvider(id: ProviderType): AgenticProvider {
  return {
    id,
    displayName: `Provider ${id}`,
    initialize: jest.fn().mockResolvedValue(undefined),
    postInitialize: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn().mockResolvedValue({ ready: true }),
  } as unknown as AgenticProvider;
}

describe('ProviderManager', () => {
  const logger = createMockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('provider', () => {
    it('returns the initial provider', () => {
      const initial = createMockProvider('llamastack');
      const factory = jest.fn();
      const manager = new ProviderManager(initial, factory, logger);
      expect(manager.provider).toBe(initial);
    });
  });

  describe('switchProvider', () => {
    it('creates, initializes, and postInitializes new provider, then shuts down old one', async () => {
      const oldProvider = createMockProvider('llamastack');
      const newProvider = createMockProvider('googleadk');
      const factory = jest.fn().mockReturnValue(newProvider);
      const manager = new ProviderManager(oldProvider, factory, logger);

      await manager.switchProvider('googleadk');

      expect(factory).toHaveBeenCalledWith('googleadk');
      expect(newProvider.initialize).toHaveBeenCalled();
      expect(newProvider.postInitialize).toHaveBeenCalled();
      expect(oldProvider.shutdown).toHaveBeenCalled();
      expect(manager.provider).toBe(newProvider);
    });

    it('to the same provider ID is a no-op', async () => {
      const provider = createMockProvider('llamastack');
      const factory = jest.fn();
      const manager = new ProviderManager(provider, factory, logger);

      await manager.switchProvider('llamastack');

      expect(factory).not.toHaveBeenCalled();
      expect(provider.initialize).not.toHaveBeenCalled();
      expect(provider.shutdown).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('already active'),
      );
    });

    it('isSwapping returns true during a swap', async () => {
      let resolveInit: () => void;
      const initPromise = new Promise<void>(r => {
        resolveInit = r;
      });
      const oldProvider = createMockProvider('llamastack');
      const newProvider = createMockProvider('googleadk');
      (newProvider.initialize as jest.Mock).mockReturnValue(initPromise);
      const factory = jest.fn().mockReturnValue(newProvider);
      const manager = new ProviderManager(oldProvider, factory, logger);

      const swapPromise = manager.switchProvider('googleadk');
      expect(manager.isSwapping).toBe(true);
      resolveInit!();
      await swapPromise;
      expect(manager.isSwapping).toBe(false);
    });

    it('concurrent swap throws "already in progress"', async () => {
      let resolveInit: () => void;
      const initPromise = new Promise<void>(r => {
        resolveInit = r;
      });
      const oldProvider = createMockProvider('llamastack');
      const newProvider = createMockProvider('googleadk');
      (newProvider.initialize as jest.Mock).mockReturnValue(initPromise);
      const factory = jest.fn().mockReturnValue(newProvider);
      const manager = new ProviderManager(oldProvider, factory, logger);

      const swapPromise = manager.switchProvider('googleadk');
      await expect(manager.switchProvider('googleadk')).rejects.toThrow(
        'already in progress',
      );
      resolveInit!();
      await swapPromise;
    });

    it('if new provider init fails, old provider remains active', async () => {
      const oldProvider = createMockProvider('llamastack');
      const newProvider = createMockProvider('googleadk');
      (newProvider.initialize as jest.Mock).mockRejectedValue(
        new Error('init failed'),
      );
      const factory = jest.fn().mockReturnValue(newProvider);
      const manager = new ProviderManager(oldProvider, factory, logger);

      await expect(manager.switchProvider('googleadk')).rejects.toThrow(
        'init failed',
      );
      expect(manager.provider).toBe(oldProvider);
      expect(oldProvider.shutdown).not.toHaveBeenCalled();
    });

    it('if old provider shutdown fails, swap still succeeds', async () => {
      const oldProvider = createMockProvider('llamastack');
      (oldProvider.shutdown as jest.Mock).mockRejectedValue(
        new Error('shutdown failed'),
      );
      const newProvider = createMockProvider('googleadk');
      const factory = jest.fn().mockReturnValue(newProvider);
      const manager = new ProviderManager(oldProvider, factory, logger);

      await manager.switchProvider('googleadk');

      expect(manager.provider).toBe(newProvider);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('shutdown error'),
      );
    });
  });
});

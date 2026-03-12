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

import type { LoggerService } from '@backstage/backend-plugin-api';
import type { ProviderType } from '@backstage-community/plugin-agentic-chat-common';
import { toErrorMessage } from '../services/utils';
import type { AgenticProvider } from './types';

/**
 * Factory function signature for creating providers by type.
 * @internal
 */
export type ProviderFactoryFn = (type: ProviderType) => AgenticProvider;

/**
 * Manages the lifecycle of the active AgenticProvider.
 *
 * Supports hot-swapping providers at runtime with a Promise-based
 * mutex to prevent concurrent swap operations. The swap uses a
 * "start new, then stop old" strategy so there is no gap in service.
 *
 * @internal
 */
export class ProviderManager {
  private current: AgenticProvider;
  private readonly factory: ProviderFactoryFn;
  private readonly logger: LoggerService;

  /** Promise-based mutex: non-null when a swap is in progress. */
  private swapLock: Promise<void> | null = null;

  constructor(
    initialProvider: AgenticProvider,
    factory: ProviderFactoryFn,
    logger: LoggerService,
  ) {
    this.current = initialProvider;
    this.factory = factory;
    this.logger = logger;
  }

  /** The currently active provider. */
  get provider(): AgenticProvider {
    return this.current;
  }

  /** Whether a provider swap is currently in progress. */
  get isSwapping(): boolean {
    return this.swapLock !== null;
  }

  /**
   * Hot-swap the active provider to a different type.
   *
   * The new provider is fully initialized before the old one is
   * shut down. If initialization fails, the old provider remains
   * active and the error is propagated to the caller.
   *
   * @param type - The provider type to switch to
   * @throws Error if a swap is already in progress (409-style)
   * @throws Error if the new provider fails to initialize
   */
  async switchProvider(type: ProviderType): Promise<void> {
    if (this.swapLock !== null) {
      throw new Error(
        'A provider swap is already in progress. Please wait and try again.',
      );
    }

    if (type === this.current.id) {
      this.logger.info(`Provider "${type}" is already active, skipping swap`);
      return;
    }

    const swapPromise = this.performSwap(type);
    this.swapLock = swapPromise;

    try {
      await swapPromise;
    } finally {
      this.swapLock = null;
    }
  }

  /**
   * Internal swap implementation. Called only when the mutex is held.
   */
  private async performSwap(type: ProviderType): Promise<void> {
    const oldId = this.current.id;
    this.logger.info(`Swapping provider from "${oldId}" to "${type}"`);

    const next = this.factory(type);

    await next.initialize();
    await next.postInitialize();

    const old = this.current;
    this.current = next;

    this.logger.info(
      `Provider swapped to "${type}" successfully, shutting down "${oldId}"`,
    );

    try {
      await old.shutdown?.();
    } catch (error) {
      this.logger.warn(
        `Old provider "${oldId}" shutdown error (non-fatal): ${toErrorMessage(
          error,
        )}`,
      );
    }
  }
}

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
import type { LoggerService } from '@backstage/backend-plugin-api';

import chokidar from 'chokidar';

import fs from 'fs';

/**
 * Represents a file watcher that can be used to monitor changes in a file.
 */
export abstract class AbstractFileWatcher<T> {
  constructor(
    protected readonly filePath: string | undefined,
    protected readonly allowReload: boolean,
    protected readonly logger: LoggerService,
  ) {}

  /**
   * Initializes the file watcher and starts watching the specified file.
   */
  abstract initialize(): Promise<void>;

  /**
   * watchFile initializes the file watcher and sets it to begin watching for changes.
   */
  watchFile(): void {
    if (!this.filePath) {
      throw new Error('File path is not specified');
    }
    const watcher = chokidar.watch(this.filePath);
    watcher.on('change', async path => {
      this.logger.info(`file ${path} has changed`);
      await this.onChange();
    });
    watcher.on('error', error => {
      this.logger.error(`error watching file ${this.filePath}: ${error}`);
    });
  }

  /**
   * Handles the change event when the watched file is modified.
   * @returns A promise that resolves when the change event is handled.
   */
  abstract onChange(): Promise<void>;

  /**
   * getCurrentContents reads the current contents of the CSV file.
   * @returns The current contents of the file.
   */
  getCurrentContents(): string {
    if (!this.filePath) {
      throw new Error('File path is not specified');
    }
    return fs.readFileSync(this.filePath, 'utf-8');
  }

  /**
   * parse is used to parse the current contents of the file.
   * @returns The file parsed into a type <T>.
   */
  abstract parse(): T;
}

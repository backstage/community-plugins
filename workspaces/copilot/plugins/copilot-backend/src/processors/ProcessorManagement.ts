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
import { LoggerService } from '@backstage/backend-plugin-api';
import { IProcessor } from './IProcessor';
import { Config } from '@backstage/config';

type Options = {
  processors: IProcessor[];
  logger: LoggerService;
  config: Config;
};

export default class ProcessorManagement {
  constructor(private readonly options: Options) {}

  static create(options: Options) {
    return new ProcessorManagement(options);
  }

  async runAsync() {
    this.options.logger.info(
      `[ProcessorManagement] Starting processing of ${this.options.processors.length} processors`,
    );

    for (const processor of this.options.processors) {
      try {
        if (!processor.shouldRun(this.options.config)) {
          this.options.logger.info(
            `[ProcessorManagement] Processor ${processor.name} skipped because shouldRun returned false.`,
          );
          continue;
        }
      } catch (e) {
        this.options.logger.error(
          `[ProcessorManagement] Error while checking shouldRun for processor ${processor.name}: ${e.message}`,
        );
        continue;
      }

      try {
        await processor.run();
      } catch (e) {
        this.options.logger.warn(
          `[ProcessorManagement] Failed to process ${processor.name}: ${e.message}`,
        );
      }
    }

    this.options.logger.info(
      `[ProcessorManagement] Completed processing of all processors`,
    );
  }
}

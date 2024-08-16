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
import {
  AuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { TaskRunner } from '@backstage/backend-tasks';
import * as uuid from 'uuid';
import { TimeSaverHandler } from './handler';
import { TimeSaverStore } from '../database/TimeSaverDatabase';

export class TsScheduler {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: RootConfigService,
    private readonly auth: AuthService,
    private readonly db: TimeSaverStore,
  ) {}

  async schedule(taskRunner: TaskRunner) {
    const tsHandler = new TimeSaverHandler(
      this.logger,
      this.config,
      this.auth,
      this.db,
    );
    await taskRunner.run({
      id: uuid.v4(),
      fn: async () => {
        this.logger.info(
          'START - Scheduler executed - fetching templates for TS plugin',
        );
        await tsHandler.fetchTemplates();
        this.logger.info(
          'STOP - Scheduler executed - fetching templates for TS plugin',
        );
      },
    });
  }
}

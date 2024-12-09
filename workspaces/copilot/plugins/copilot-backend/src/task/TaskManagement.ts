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
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { GithubClient } from '../client/GithubClient';
import { DatabaseHandler } from '../db/DatabaseHandler';
import { discoverOrganizationMetrics } from './OrganizationTask';
import { discoverOrganizationTeamMetrics } from './OrganizationTeamTask';
import { discoverEnterpriseMetrics } from './EnterpriseTask';
import { discoverEnterpriseTeamMetrics } from './EnterpriseTeamTask';

export type TaskOptions = {
  api: GithubClient;
  config: Config;
  logger: LoggerService;
  db: DatabaseHandler;
};

export default class TaskManagement {
  private readonly tasks: Array<() => Promise<void>>;

  constructor(private readonly options: TaskOptions) {
    this.tasks = [
      () => discoverOrganizationMetrics(this.options),
      () => discoverOrganizationTeamMetrics(this.options),
      () => discoverEnterpriseMetrics(this.options),
      () => discoverEnterpriseTeamMetrics(this.options),
    ];
  }

  static create(options: TaskOptions) {
    return new TaskManagement(options);
  }

  async runAsync() {
    this.options.logger.info(
      `[TaskManagement] Starting processing of ${this.tasks.length} tasks`,
    );

    const taskPromises = this.tasks.map(async task => {
      try {
        await task();
      } catch (e) {
        this.options.logger.warn(
          `[TaskManagement] Failed to process task: ${e.message}`,
        );
      }
    });

    await Promise.all(taskPromises);

    this.options.logger.info(
      `[TaskManagement] Completed processing of all tasks`,
    );
  }
}

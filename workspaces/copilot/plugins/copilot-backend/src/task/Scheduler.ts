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
import { GithubClient } from '../client/GithubClient';
import { DatabaseHandler } from '../db/DatabaseHandler';
import ProcessorManagement from '../processors/ProcessorManagement';
import { EnterpriseProcessor } from '../processors/EnterpriseProcessor';
import { EnterpriseTeamProcessor } from '../processors/EnterpriseTeamProcessor';
import { OrganizationProcessor } from '../processors/OrganizationProcessor';
import { Config } from '@backstage/config';
import { OrganizationTeamProcessor } from '../processors/OrganizationTeamProcessor';

type Options = {
  api: GithubClient;
  config: Config;
  logger: LoggerService;
  db: DatabaseHandler;
};

export default class Scheduler {
  constructor(private readonly options: Options) {}

  static create(options: Options) {
    return new Scheduler(options);
  }

  async run() {
    const runner = new ProcessorManagement({
      ...this.options,
      processors: [
        new EnterpriseProcessor(this.options),
        new EnterpriseTeamProcessor(this.options),
        new OrganizationProcessor(this.options),
        new OrganizationTeamProcessor(this.options),
      ],
    });

    await runner.runAsync();
  }
}

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
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskRunner,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { InputError, isError, NotFoundError } from '@backstage/errors';

import type {
  RBACProvider,
  RBACProviderConnection,
} from '@backstage-community/plugin-rbac-node';
import { parse } from 'csv-parse/sync';

import fs from 'fs';

export type TestProviderConfig = {
  baseUrl: string;
  accessToken: string;
  schedule?: SchedulerServiceTaskScheduleDefinition;
};

export class TestProvider implements RBACProvider {
  private readonly scheduleFn: () => Promise<void>;
  private readonly logger: LoggerService;
  private connection?: RBACProviderConnection;

  static fromConfig(
    deps: {
      config: Config;
      logger: LoggerService;
    },
    options:
      | { schedule: SchedulerServiceTaskRunner }
      | { scheduler: SchedulerService },
  ): TestProvider {
    const providerConfig = readProviderConfig(deps.config);
    let schedulerServiceTaskRunner;

    if ('scheduler' in options && providerConfig.schedule) {
      schedulerServiceTaskRunner = options.scheduler.createScheduledTaskRunner(
        providerConfig.schedule,
      );
    } else if ('schedule' in options) {
      schedulerServiceTaskRunner = options.schedule;
    } else {
      throw new InputError(
        `No schedule provided via config for RBACTestProvider.`,
      );
    }

    return new TestProvider(schedulerServiceTaskRunner, deps.logger);
  }

  private constructor(
    schedulerServiceTaskRunner: SchedulerServiceTaskRunner,
    logger: LoggerService,
  ) {
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.scheduleFn = this.createScheduleFN(schedulerServiceTaskRunner);
  }

  getProviderName(): string {
    return `testProvider`;
  }

  async connect(connection: RBACProviderConnection): Promise<void> {
    this.connection = connection;
    this.scheduleFn();
  }

  async refresh(): Promise<void> {
    try {
      await this.run();
    } catch (error: any) {
      this.logger.error(`Error occurred, here is the error ${error}`);
    }
  }

  private createScheduleFN(
    schedulerServiceTaskRunner: SchedulerServiceTaskRunner,
  ): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:run`;
      return schedulerServiceTaskRunner.run({
        id: taskId,
        fn: async () => {
          try {
            await this.run();
          } catch (error) {
            if (isError(error)) {
              this.logger.error(`Error occurred, here is the error ${error}`);
            }
          }
        },
      });
    };
  }

  private async run(): Promise<void> {
    if (!this.connection) {
      throw new NotFoundError('Not initialized');
    }
    const permissions: string[][] = [];
    const roles: string[][] = [];

    const contents = readFromCSV();

    contents.forEach(policy => {
      const convertedPolicy = metadataStringToPolicy(policy);
      if (convertedPolicy[0] === 'p') {
        convertedPolicy.splice(0, 1);
        permissions.push(convertedPolicy);
      } else if (convertedPolicy[0] === 'g') {
        convertedPolicy.splice(0, 1);
        roles.push(convertedPolicy);
      }
    });

    await this.connection.applyRoles(roles);
    await this.connection.applyPermissions(permissions);
  }
}

function readProviderConfig(config: Config): TestProviderConfig {
  const rbacConfig = config.getOptionalConfig('permission.rbac.providers.test');
  if (!rbacConfig) {
    return {
      baseUrl: '',
      accessToken: '',
    };
  }

  const baseUrl = rbacConfig.getString('baseUrl');
  const accessToken = rbacConfig.getString('accessToken');
  const schedule = rbacConfig.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        rbacConfig.getConfig('schedule'),
      )
    : undefined;

  return {
    baseUrl,
    accessToken,
    schedule,
  };
}

function readFromCSV(): string[] {
  const content = fs.readFileSync(
    '../../plugins/rbac-backend-module-test/test-policy.csv',
    'utf-8',
  );
  const parser: string[][] = parse(content, {
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  const newFlatContent = parser.flatMap(data => {
    return policyToString(data);
  });

  return newFlatContent;
}

function policyToString(policy: string[]): string {
  return `[${policy.join(', ')}]`;
}

function metadataStringToPolicy(policy: string): string[] {
  return policy.replace('[', '').replace(']', '').split(', ');
}

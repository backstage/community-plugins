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
import { DoraTeam } from '@backstage-community/plugin-devlake-common';

/** @internal */
export interface DevlakeDbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

/** @internal */
export interface DevlakeConfig {
  db: DevlakeDbConfig;
  teams: DoraTeam[];
}

/** @internal */
export function readDevlakeConfig(config: Config): DevlakeConfig {
  const devlakeConfig = config.getConfig('devlake');
  const dbConfig = devlakeConfig.getConfig('db');

  const db: DevlakeDbConfig = {
    host: dbConfig.getString('host'),
    port: dbConfig.getOptionalNumber('port') ?? 3306,
    user: dbConfig.getString('user'),
    password: dbConfig.getString('password'),
    database: dbConfig.getString('database'),
    ssl: dbConfig.getOptionalBoolean('ssl') ?? false,
  };

  const teamsConfig = devlakeConfig.getOptionalConfigArray('teams') ?? [];
  const teams: DoraTeam[] = teamsConfig.map(teamConfig => ({
    name: teamConfig.getString('name'),
    devlakeProjectName: teamConfig.getString('devlakeProjectName'),
  }));

  return { db, teams };
}

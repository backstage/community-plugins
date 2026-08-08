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

import { ConfigReader } from '@backstage/config';
import { readDevlakeConfig } from './config';

const baseDbConfig = {
  host: 'db.example.com',
  user: 'devlake',
  password: 'secret',
  database: 'devlake',
};

describe('readDevlakeConfig', () => {
  it('reads all required db fields', () => {
    const config = new ConfigReader({
      devlake: { db: { ...baseDbConfig, port: 3306 } },
    });
    const result = readDevlakeConfig(config);
    expect(result.db.host).toBe('db.example.com');
    expect(result.db.port).toBe(3306);
    expect(result.db.user).toBe('devlake');
    expect(result.db.password).toBe('secret');
    expect(result.db.database).toBe('devlake');
  });

  it('defaults port to 3306 when not specified', () => {
    const config = new ConfigReader({
      devlake: { db: baseDbConfig },
    });
    const result = readDevlakeConfig(config);
    expect(result.db.port).toBe(3306);
  });

  it('defaults ssl to false when not specified', () => {
    const config = new ConfigReader({
      devlake: { db: baseDbConfig },
    });
    const result = readDevlakeConfig(config);
    expect(result.db.ssl).toBe(false);
  });

  it('reads ssl flag when set to true', () => {
    const config = new ConfigReader({
      devlake: { db: { ...baseDbConfig, ssl: true } },
    });
    const result = readDevlakeConfig(config);
    expect(result.db.ssl).toBe(true);
  });

  it('reads teams correctly', () => {
    const config = new ConfigReader({
      devlake: {
        db: baseDbConfig,
        teams: [
          { name: 'Team Alpha', devlakeProjectName: 'project-alpha' },
          { name: 'Team Beta', devlakeProjectName: 'project-beta' },
        ],
      },
    });
    const result = readDevlakeConfig(config);
    expect(result.teams).toHaveLength(2);
    expect(result.teams[0]).toEqual({
      name: 'Team Alpha',
      devlakeProjectName: 'project-alpha',
    });
    expect(result.teams[1]).toEqual({
      name: 'Team Beta',
      devlakeProjectName: 'project-beta',
    });
  });

  it('returns an empty teams array when teams are not configured', () => {
    const config = new ConfigReader({
      devlake: { db: baseDbConfig },
    });
    const result = readDevlakeConfig(config);
    expect(result.teams).toEqual([]);
  });

  it('throws when the devlake config section is missing', () => {
    const config = new ConfigReader({});
    expect(() => readDevlakeConfig(config)).toThrow();
  });

  it('throws when required db fields are missing', () => {
    const config = new ConfigReader({
      devlake: { db: { host: 'localhost' } },
    });
    expect(() => readDevlakeConfig(config)).toThrow();
  });
});

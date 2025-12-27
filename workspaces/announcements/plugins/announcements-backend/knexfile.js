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
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Default to pg if POSTGRES_HOST is set, otherwise default to better-sqlite3
const defaultClient = process.env.POSTGRES_HOST ? 'pg' : 'better-sqlite3';
const client = process.env.PLUGIN_ANNOUNCEMENTS_KNEX_CLIENT ?? defaultClient;

const connections = {
  pg: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: 'backstage_plugin_announcements',
  },
  'better-sqlite3': {
    filename: path.join(__dirname, 'db', 'local.sqlite'),
  },
};

if (!connections[client]) {
  throw new Error(
    `Invalid client "${client}". Must be one of: ${Object.keys(
      connections,
    ).join(', ')}`,
  );
}

export default {
  development: {
    client,
    connection: connections[client],
    useNullAsDefault: client === 'better-sqlite3',
    seeds: {
      directory: './db/seeds',
    },
    migrations: {
      directory: './db/migrations',
    },
  },
};

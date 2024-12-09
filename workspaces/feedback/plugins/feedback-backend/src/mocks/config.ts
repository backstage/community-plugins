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
export const mockConfig = {
  app: {
    title: 'Backstage Test App',
    baseUrl: 'http://localhost:3000',
  },
  backend: {
    baseUrl: 'http://localhost:7007',
    database: {
      client: 'better-sqlite3',
      connection: ':memory:',
    },
  },
  feedback: {
    integrations: {
      email: {
        host: 'smtp-host',
        port: 587,
        auth: {},
        secure: false,
        from: '"Example" <noreply@example.com>',
        caCert: process.env.NODE_EXTRA_CA_CERTS,
      },
      jira: [
        {
          host: 'https://jira.host',
          token: '###',
        },
      ],
      notifications: true,
    },
  },
};

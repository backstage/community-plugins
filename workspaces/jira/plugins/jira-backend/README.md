# Jira Backend Plugin

This is a Backstage plugin for integrating with Jira. It allows fetching Jira issues based on JQL queries, storing them in a database, and retrieving those issues via a Backstage API.

## Features

- Fetch Jira issues using JQL.
- Store Jira issues in the database.
- Retrieve stored Jira issues via API.
- Retrieve the current user's email for scheduled jobs.

## Getting Started

### Prerequisites

Before using this plugin, ensure that you have:

- A running instance of Backstage.
- A Jira account with access to the Jira API.
- A PostgreSQL database or another supported database to store Jira issues.

### Installation

1. **Install the plugin:**

   Add the Jira backend plugin to your Backstage backend:

   ```bash
   yarn add @backstage/plugin-jira-backend
   ```
2. **Configure the plugin:**

   Add the following to your app-config.yaml file:
   ```yaml
   auth:
    jira:
        target: 'https://your-jira-instance.atlassian.net'
        token: '${JIRA_API_TOKEN}'
    ```
   Ensure that the necessary environment variables are set:
   ```bash
    export JIRA_API_TOKEN=<your-jira-api-token>
   ```
3. Database Setup:

   Ensure that your database has the appropriate schema to store Jira issues. You may need to create tables such as jira_issues and current_user.   
      
4. Register the plugin:

   In packages/backend/src/plugins.ts, register the Jira backend plugin:
   ```typescript
   import { createRouter } from '@backstage/plugin-jira-backend';
   import { Router } from 'express';

   export default async function createPlugin(env: PluginEnvironment): Promise<Router> {
   return await createRouter({
      database: env.database,
      config: env.config,
   });
   }
   ```

## API Endpoints
   ### Fetch Jira Issues
   Fetch Jira issues based on a JQL query and store them in the database:
      
 ```bash
   POST /api/jira/issues/fetch
   {
   "jql": "project = PROJ",
   "maxResults": 100,
   "startAt": 0,
   "username": "user@example.com"
   }
   ```
   ### Retrieve Stored Jira Issues
   Fetch all Jira issues stored in the database:
         
   ```bash
   GET /api/jira/issues
   ```
   ### Get Current User Email
   Retrieve the email of the current user from the database:
   
   ```bash
   GET /api/jira/current-user-email
   ```

## Development
   If you want to contribute to the Jira backend plugin, follow these steps:

   1. Clone the Backstage repository:
```bash
   git clone https://github.com/backstage/backstage.git
```

   2. Navigate to the plugin directory:
```bash
   cd plugins/jira-backend
```

   3. Install the dependencies:
```bash
   yarn install
```

   4. Run the tests:
```bash
   yarn test
```
## Contributing
   We welcome contributions to improve this plugin. If you have suggestions or want to report a bug, feel free to open an issue or submit a pull request.

## License

   ```text
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

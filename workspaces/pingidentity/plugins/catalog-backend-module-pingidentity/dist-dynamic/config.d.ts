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
import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  catalog?: {
    providers?: {
      pingIdentityOrg?: {
        [key: string]: {
          /**
           * pingIdentityOrgConfig
           */
          /**
           * The PingOne API path
           */
          apiPath: string;
          /**
           * The PingOne Auth path
           */
          authPath: string;
          /**
           * The envId where the application is located
           */
          envId: string;
          /**
           * PingIdentityClientCredentials
           */
          /**
           * Ping Identity credentials. Use together with "clientSecret".
           */
          clientId: string;
          /**
           * Ping Identity credentials. Use together with "clientId".
           * @visibility secret
           */
          clientSecret: string;
          /**
           * Schedule configuration for refresh tasks.
           */
          schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
          /**
           * The number of users to query at a time.
           * @defaultValue 100
           * @remarks
           * This is a performance optimization to avoid querying too many users at once.
           * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#paging-ordering-and-filtering-collections
           */
          userQuerySize?: number;
          /**
           * The number of groups to query at a time.
           * @defaultValue 100
           * @remarks
           * This is a performance optimization to avoid querying too many groups at once.
           * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#paging-ordering-and-filtering-collections
           */
          groupQuerySize?: number;
        };
      };
    };
  };
}

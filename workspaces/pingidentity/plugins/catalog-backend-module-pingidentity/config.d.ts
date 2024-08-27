import {
  SchedulerServiceTaskScheduleDefinitionConfig
} from '@backstage/backend-plugin-api';

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
        }
      };
    };
  };
}

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
           * Schedule configuration for refresh tasks.
           */
          schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
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
        }
      };
    };
  };
}

import type { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  catalog?: {
    providers?: {
      threeScaleApiEntity?: {
        [key: string]: {
          /**
           * ThreeScaleConfig
           */
          baseUrl: string;
          /** @visibility secret */
          accessToken: string;
          systemLabel?: string;
          ownerLabel?: string;
          addLabels?: boolean;
          schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        };
      };
    };
  };
}

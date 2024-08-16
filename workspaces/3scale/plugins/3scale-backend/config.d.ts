import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

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
          schedule?: TaskScheduleDefinitionConfig;
        };
      };
    };
  };
}

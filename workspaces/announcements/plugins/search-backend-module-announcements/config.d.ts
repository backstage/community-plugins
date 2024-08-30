import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  search?: {
    collators?: {
      /**
       * Configuration options for `@procore-oss/backstage-plugin-search-backend-module-announcements`
       */
      announcements?: {
        /**
         * The schedule for how often to run the collation job.
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
      };
    };
  };
}

import { TaskScheduleDefinition } from '@backstage/backend-tasks';

export type ThreeScaleConfig = {
  id: string;
  baseUrl: string;
  accessToken: string;
  systemLabel?: string;
  ownerLabel?: string;
  addLabels?: boolean;
  schedule?: TaskScheduleDefinition;
};

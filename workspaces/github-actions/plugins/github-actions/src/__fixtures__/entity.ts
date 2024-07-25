import { GITHUB_ACTIONS_ANNOTATION } from '../components/getProjectNameFromEntity';

export const sampleEntity = {
  entity: {
    metadata: {
      annotations: { [GITHUB_ACTIONS_ANNOTATION]: 'backstage/backstage' },
    },
  },
};

import { GITHUB_ACTIONS_ANNOTATION } from '../components/getProjectNameFromEntity';

export const sampleEntity = {
  entity: {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'backstage',
      annotations: { [GITHUB_ACTIONS_ANNOTATION]: 'backstage/backstage' },
    },
    spec: {
      lifecycle: 'experimental',
      type: 'library',
      owner: 'cncf',
    },
  },
};

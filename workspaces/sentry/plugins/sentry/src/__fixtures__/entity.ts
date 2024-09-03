import { SENTRY_PROJECT_SLUG_ANNOTATION } from '../components/hooks';

export const sampleEntity = {
  entity: {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'backstage',
      annotations: { [SENTRY_PROJECT_SLUG_ANNOTATION]: 'PROJECT_SLUG' },
    },
    spec: {
      lifecycle: 'experimental',
      type: 'library',
      owner: 'cncf',
    },
  },
};

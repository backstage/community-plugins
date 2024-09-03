import { SENTRY_PROJECT_SLUG_ANNOTATION } from '../components/hooks';

export const sampleEntity = {
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
};

export const sampleEntityWithoutAnnotation = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    annotations: {},
  },
  spec: {
    lifecycle: 'experimental',
    type: 'library',
    owner: 'cncf',
  },
};

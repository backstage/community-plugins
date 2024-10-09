import type { Entity } from '@backstage/catalog-model';

export const entityMock: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'nexus-repository-manager/docker.image-name':
        'janus-idp/backstage-showcase',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

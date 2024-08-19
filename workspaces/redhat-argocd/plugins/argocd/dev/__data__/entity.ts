import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'argocd/app-selector':
        'rht-gitops.com/janus-argocd=quarkus-app-bootstrap',
      'argocd/project-name': 'project-name',
      'argocd/instance-name': 'instance-1',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-website',
    title: 'Example App',
    namespace: 'default',
    annotations: {
      'feedback/type': 'MAIL',
      'feedback/email-to': 'john.doe@example.com',
    },
    spec: {
      owner: 'guest',
      type: 'service',
      lifecycle: 'production',
    },
  },
};

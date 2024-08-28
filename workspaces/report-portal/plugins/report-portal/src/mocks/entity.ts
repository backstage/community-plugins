import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-for-report-portal',
    title: 'Example App',
    namespace: 'default',
    annotations: {
      'reportportal.io/host':
        'reportportal-hydra.apps.ocp-c1.prod.psi.redhat.com',
      'reportportal.io/project-name': 'dxp_qe',
      'reportportal.io/launch-name': 'Demo API Tests',
    },
    spec: {
      owner: 'guest',
      type: 'service',
      lifecycle: 'production',
    },
  },
};

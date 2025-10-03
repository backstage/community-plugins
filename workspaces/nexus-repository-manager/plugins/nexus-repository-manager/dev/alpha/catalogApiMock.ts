import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';

export const catalogApi = catalogApiMock({
  entities: [
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'docker-example',
        description:
          'An example component with a Docker Nexus artifact annotation',
        annotations: {
          'nexus-repository-manager/docker.image-name': 'cypress/base',
        },
      },
      spec: {
        lifecycle: 'production',
        type: 'service',
        owner: 'guest',
      },
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'maven-example',
        description:
          'An example component with a Maven Nexus artifact annotation',
        annotations: {
          'nexus-repository-manager/maven.group-id': 'org.apache.logging.log4j',
        },
      },
      spec: {
        lifecycle: 'production',
        type: 'service',
        owner: 'guest',
      },
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'guest',
      },
    },
  ],
});

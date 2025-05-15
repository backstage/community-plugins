/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ConfigReader } from '@backstage/config';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';

export const mockConfig = new ConfigReader({
  argocd: {
    username: 'admin',
    password: 'pass',
    appLocatorMethods: [
      {
        type: 'config',
        instances: [
          {
            name: 'test-instance',
            url: 'https://argocd.example.com',
            token: 'test-token',
          },
          {
            name: 'staging-instance',
            url: 'https://argocd.staging.example.com',
            token: 'test-staging-token',
          },
        ],
      },
    ],
  },
});

export const mockApplications: Application[] = [
  {
    metadata: {
      name: 'test-app',
      namespace: 'test',
      instance: {
        name: 'test-instance',
        url: 'https://argocd.example.com',
      },
      labels: {
        test: 'true',
        clusterName: 'minikube',
      },
    },
    spec: {
      source: {
        repoURL: 'https://github.com/test/repo',
        path: 'kubernetes',
        targetRevision: 'main',
        helm: {
          parameters: [{ name: 'replicaCount', value: '2' }],
        },
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'test',
      },
      project: 'testing',
    },
    status: {
      sync: {
        status: 'Synced',
        revision: 'abc123',
      },
      health: {
        status: 'Healthy',
      },
      operationState: {
        operation: {
          sync: {
            revision: 'abc123',
          },
        },
        phase: 'Succeeded',
      },
      summary: {
        images: ['test-image:latest'],
      },
    },
  },
  {
    metadata: {
      name: 'staging-app',
      namespace: 'staging',
      instance: {
        name: 'staging-instance',
        url: 'https://argocd.staging.example.com',
      },
      labels: {
        clusterName: 'microk8s',
      },
    },
    spec: {
      source: {
        repoURL: 'https://github.com/staging/repo',
        path: 'kubernetes',
        targetRevision: 'main',
        helm: {
          parameters: [{ name: 'replicaCount', value: '2' }],
        },
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'staging',
      },
      project: 'staging',
    },
    status: {
      sync: {
        status: 'Synced',
        revision: 'def456',
      },
      health: {
        status: 'Healthy',
      },
      operationState: {
        operation: {
          sync: {
            revision: 'def456',
          },
        },
        phase: 'Succeeded',
      },
      summary: {
        images: ['staging-image:latest'],
      },
    },
  },
  {
    metadata: {
      name: 'multi-source-app',
      namespace: 'argocd',
      uid: 'abcd1234-5678-90ef-ghij-klmnopqrstuv',
      resourceVersion: '405389',
      generation: 408,
      creationTimestamp: new Date('2025-02-20T16:39:18Z'),
      labels: {
        app: 'fullstack',
      },
      instance: {
        name: 'test-instance',
        url: 'https://argocd.example.com',
      },
    },
    spec: {
      destination: {
        server: 'https://kubernetes.example.cluster:6443',
        namespace: 'demo',
      },
      project: 'demo',
      source: {
        repoURL: '',
      },
      sources: [
        {
          repoURL: 'https://github.com/example-org/frontend-app.git',
          path: '.',
          targetRevision: 'HEAD',
        },
        {
          repoURL: 'https://github.com/example-org/backend-app.git',
          path: '.',
          targetRevision: 'HEAD',
        },
      ],
    },
    status: {
      resources: [
        {
          version: 'v1',
          kind: 'Namespace',
          name: 'backend-system',
          status: 'OutOfSync',
        },
        {
          version: 'v1',
          kind: 'Service',
          namespace: 'argocd',
          name: 'argocd-server-nodeport',
          status: 'Synced',
          health: {
            status: 'Healthy',
          },
        },
        {
          version: 'v1',
          kind: 'Service',
          namespace: 'frontend-system',
          name: 'frontend-app',
          status: 'Synced',
          health: {
            status: 'Healthy',
          },
        },
        {
          version: 'v1',
          kind: 'Service',
          namespace: 'backend-system',
          name: 'backend-service',
          status: 'OutOfSync',
          health: {
            status: 'Healthy',
          },
        },
        {
          group: 'apps',
          version: 'v1',
          kind: 'Deployment',
          namespace: 'demo-apps',
          name: 'fullstack-demo',
          status: 'Synced',
          health: {
            status: 'Healthy',
          },
        },
        {
          group: 'apps',
          version: 'v1',
          kind: 'Deployment',
          namespace: 'redis-system',
          name: 'backend',
          status: 'OutOfSync',
          health: {
            status: 'Healthy',
          },
        },
        {
          group: 'networking.k8s.io',
          version: 'v1',
          kind: 'NetworkPolicy',
          namespace: 'redis-system',
          name: 'backend-network-policy',
          status: 'OutOfSync',
        },
      ],
      sync: {
        status: 'OutOfSync',
        comparedTo: {
          source: {
            repoURL: '',
          },
          destination: {
            server: 'https://kubernetes.default.svc',
            namespace: 'demo',
          },
          sources: [
            {
              repoURL: 'https://github.com/example-org/frontend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
            {
              repoURL: 'https://github.com/example-org/backend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
          ],
        },
        revisions: [
          'abc123def456ghi789jkl012mno345pqr678stu',
          'xyz987wvu654tsr321qpo098nml765kji432hgf',
        ],
      },
      health: {
        status: 'Healthy',
      },
      history: [
        {
          deployedAt: '2025-02-20T16:40:32Z',
          id: 0,
          source: {
            repoURL: '',
          },
          deployStartedAt: '2025-02-20T16:40:31Z',
          sources: [
            {
              repoURL: 'https://github.com/example-org/frontend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
            {
              repoURL: 'https://github.com/example-org/backend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
          ],
          revisions: [
            '331386ce09e4536a730a16f10d1bce8dfca0c8b1',
            'de1631a6d84f35d826235a933657baca77c2ca9c',
          ],
          initiatedBy: {
            username: 'admin',
          },
        },
      ],
      reconciledAt: '2025-02-25T19:32:40Z',
      operationState: {
        operation: {
          sync: {
            syncStrategy: {
              hook: {},
            },
            sources: [
              {
                repoURL: 'https://github.com/example-org/frontend-app.git',
                path: '.',
                targetRevision: 'HEAD',
              },
              {
                repoURL: 'https://github.com/example-org/backend-app.git',
                path: '.',
                targetRevision: 'HEAD',
              },
            ],
            revisions: [
              '331386ce09e4536a730a16f10d1bce8dfca0c8b1',
              'de1631a6d84f35d826235a933657baca77c2ca9c',
            ],
          },
          initiatedBy: {
            username: 'admin',
          },
          retry: {},
        },
        phase: 'Succeeded',
        message: 'successfully synced (all tasks run)',
        syncResult: {
          resources: [
            {
              group: '',
              version: 'v1',
              kind: 'Namespace',
              namespace: 'demo',
              name: 'redis-system',
              status: 'Synced',
              message: 'namespace/redis-system created',
              hookPhase: 'Running',
              syncPhase: 'Sync',
            },
            {
              group: 'networking.k8s.io',
              version: 'v1',
              kind: 'NetworkPolicy',
              namespace: 'redis-system',
              name: 'redis-network-policy',
              status: 'Synced',
              message:
                'networkpolicy.networking.k8s.io/redis-network-policy created',
              hookPhase: 'Running',
              syncPhase: 'Sync',
            },
            {
              group: '',
              version: 'v1',
              kind: 'Service',
              namespace: 'redis-system',
              name: 'redis-service',
              status: 'Synced',
              message: 'service/redis-service created',
              hookPhase: 'Running',
              syncPhase: 'Sync',
            },
            {
              group: '',
              version: 'v1',
              kind: 'Service',
              namespace: 'demo-apps',
              name: 'nginx-demo',
              status: 'Synced',
              message: 'service/nginx-demo created',
              hookPhase: 'Running',
              syncPhase: 'Sync',
            },
            {
              group: '',
              version: 'v1',
              kind: 'Service',
              namespace: 'argocd',
              name: 'argocd-server-nodeport',
              status: 'Synced',
              message: 'service/argocd-server-nodeport configured',
              hookPhase: 'Running',
              syncPhase: 'Sync',
            },
            {
              group: 'apps',
              version: 'v1',
              kind: 'Deployment',
              namespace: 'demo-apps',
              name: 'nginx-demo',
              status: 'Synced',
              message: 'deployment.apps/nginx-demo created',
              hookPhase: 'Running',
              syncPhase: 'Sync',
            },
            {
              group: 'apps',
              version: 'v1',
              kind: 'Deployment',
              namespace: 'redis-system',
              name: 'redis',
              status: 'Synced',
              message: 'deployment.apps/redis created',
              hookPhase: 'Running',
              syncPhase: 'Sync',
            },
          ],
          revision: '',
          source: {
            repoURL: '',
          },
          sources: [
            {
              repoURL: 'https://github.com/example-org/frontend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
            {
              repoURL: 'https://github.com/example-org/backend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
          ],
          revisions: [
            '331386ce09e4536a730a16f10d1bce8dfca0c8b1',
            'de1631a6d84f35d826235a933657baca77c2ca9c',
          ],
        },
        startedAt: '2025-02-20T16:40:31Z',
        finishedAt: '2025-02-20T16:40:32Z',
      },
      summary: {
        images: ['example/frontend:v1.2.3', 'example/backend:v4.5.6'],
      },
      sourceTypes: ['Directory', 'Directory'],
      controllerNamespace: 'argocd',
    },
  },
];

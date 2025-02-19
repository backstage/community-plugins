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
import { Application } from '../types';

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
        token: 'test-token',
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
        url: 'https://argocd.example.com',
        token: 'test-token',
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
];

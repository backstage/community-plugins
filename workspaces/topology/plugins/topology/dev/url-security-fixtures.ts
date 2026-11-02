/*
 * Copyright 2026 The Backstage Authors
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

import { unsafeScriptUrl } from '../src/test-utils/unsafeScriptUrl';
import { MAX_URL_LENGTH } from '../src/utils/url-utils';

const K8S_ID = 'backstage';
const NAMESPACE = 'url-security';

/**
 * Minimal Deployment fixture for Topology URL-security scenarios.
 * Node names map 1:1 to what you should verify in the graph.
 */
const makeDeployment = ({
  name,
  uid,
  annotations = {},
}: {
  name: string;
  uid: string;
  annotations?: Record<string, string>;
}) => ({
  kind: 'Deployment',
  apiVersion: 'apps/v1',
  metadata: {
    name,
    namespace: NAMESPACE,
    uid,
    resourceVersion: '1',
    generation: 1,
    labels: {
      'backstage.io/kubernetes-id': K8S_ID,
      'app.kubernetes.io/instance': name,
      app: name,
    },
    annotations: {
      'deployment.kubernetes.io/revision': '1',
      'app.openshift.io/runtime': 'nodejs',
      ...annotations,
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: { app: name },
    },
    template: {
      metadata: {
        labels: {
          app: name,
          'backstage.io/kubernetes-id': K8S_ID,
        },
      },
      spec: {
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [{ containerPort: 8080, protocol: 'TCP' }],
            resources: {},
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
      },
    },
  },
  status: {
    observedGeneration: 1,
    replicas: 1,
    updatedReplicas: 1,
    readyReplicas: 1,
    availableReplicas: 1,
    conditions: [
      {
        type: 'Available',
        status: 'True',
        reason: 'MinimumReplicasAvailable',
        message: 'Deployment has minimum availability.',
      },
    ],
  },
});

const makeService = ({ name, uid }: { name: string; uid: string }) => ({
  kind: 'Service',
  apiVersion: 'v1',
  metadata: {
    name,
    namespace: NAMESPACE,
    uid,
    labels: {
      'backstage.io/kubernetes-id': K8S_ID,
      app: name,
    },
  },
  spec: {
    selector: { app: name },
    ports: [{ name: 'http', protocol: 'TCP', port: 8080, targetPort: 8080 }],
    type: 'ClusterIP',
  },
  status: { loadBalancer: {} },
});

const makeIngress = ({
  name,
  uid,
  serviceName,
  host,
}: {
  name: string;
  uid: string;
  serviceName: string;
  host: string;
}) => ({
  kind: 'Ingress',
  apiVersion: 'networking.k8s.io/v1',
  metadata: {
    name,
    namespace: NAMESPACE,
    uid,
    labels: {
      'backstage.io/kubernetes-id': K8S_ID,
    },
  },
  spec: {
    ingressClassName: 'nginx',
    tls: [{ hosts: [host] }],
    rules: [
      {
        host,
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: serviceName,
                  port: { number: 8080 },
                },
              },
            },
          ],
        },
      },
    ],
  },
  status: { loadBalancer: { ingress: [{ ip: '127.0.0.1' }] } },
});

const makeRoute = ({
  name,
  uid,
  serviceName,
  host,
}: {
  name: string;
  uid: string;
  serviceName: string;
  host: string;
}) => ({
  kind: 'Route',
  apiVersion: 'route.openshift.io/v1',
  metadata: {
    name,
    namespace: NAMESPACE,
    uid,
    labels: {
      'backstage.io/kubernetes-id': K8S_ID,
      app: serviceName,
    },
  },
  spec: {
    host,
    to: { kind: 'Service', name: serviceName, weight: 100 },
    port: { targetPort: 'http' },
    tls: { termination: 'edge' },
    wildcardPolicy: 'None',
  },
  status: {
    ingress: [
      {
        host,
        routerName: 'default',
        conditions: [
          {
            type: 'Admitted',
            status: 'True',
            lastTransitionTime: '2026-01-01T00:00:00Z',
          },
        ],
        wildcardPolicy: 'None',
      },
    ],
  },
});

/** >2048 chars — triggers ReDoS guard / git URL length rejection */
export const LONG_INVALID_GIT_URL = `https://github.com/org/${'a'.repeat(
  MAX_URL_LENGTH,
)}`;

/**
 * Deployments that appear as Topology nodes for URL-security manual testing.
 *
 * Expected UI checks (on entity `backstage` → Topology):
 * - safe-https-links: clickable edit decorator + ingress/route https URL
 * - unsafe-scheme-plaintext: edit decorator present from annotation but not a
 *   clickable script-scheme link (falls through to null edit URL / non-link)
 * - bad-edit-url-fallback: malicious edit-url ignored; https vcs-uri used
 * - invalid-git-uri: no crash; no usable edit link
 * - long-git-url: no hang; no usable edit link
 */
export const urlSecurityDeployments = [
  makeDeployment({
    name: 'safe-https-links',
    uid: 'url-security-safe-https-0001',
    annotations: {
      'app.openshift.io/edit-url':
        'https://github.com/backstage/community-plugins/edit/main/README.md',
      'app.openshift.io/vcs-uri':
        'https://github.com/backstage/community-plugins',
      'app.openshift.io/vcs-ref': 'main',
    },
  }),
  makeDeployment({
    name: 'unsafe-scheme-plaintext',
    uid: 'url-security-unsafe-scheme-0002',
    annotations: {
      // Unsafe edit URL only — must not become a script-scheme link
      'app.openshift.io/edit-url': unsafeScriptUrl('alert("xss")'),
    },
  }),
  makeDeployment({
    name: 'bad-edit-url-fallback',
    uid: 'url-security-bad-edit-fallback-0003',
    annotations: {
      'app.openshift.io/edit-url': unsafeScriptUrl('alert("xss")'),
      'app.openshift.io/vcs-uri': 'https://github.com/backstage/backstage',
      'app.openshift.io/vcs-ref': 'master',
    },
  }),
  makeDeployment({
    name: 'invalid-git-uri',
    uid: 'url-security-invalid-git-0004',
    annotations: {
      'app.openshift.io/vcs-uri': 'not a git url',
      'app.openshift.io/vcs-ref': 'main',
    },
  }),
  makeDeployment({
    name: 'long-git-url',
    uid: 'url-security-long-git-0005',
    annotations: {
      'app.openshift.io/vcs-uri': LONG_INVALID_GIT_URL,
      'app.openshift.io/vcs-ref': 'main',
    },
  }),
];

/** Service + Ingress + Route for `safe-https-links` (clickable location URLs). */
export const urlSecurityServices = [
  makeService({ name: 'safe-https-links', uid: 'url-security-svc-safe-0001' }),
];

export const urlSecurityIngresses = [
  makeIngress({
    name: 'safe-https-links-ingress',
    uid: 'url-security-ing-safe-0001',
    serviceName: 'safe-https-links',
    host: 'safe-https-links.apps.example.com',
  }),
];

export const urlSecurityRoutes = [
  makeRoute({
    name: 'safe-https-links-route',
    uid: 'url-security-rte-safe-0001',
    serviceName: 'safe-https-links',
    host: 'safe-https-links.apps.example.com',
  }),
];

/**
 * Service for the unsafe-scheme node so it still appears as a normal workload;
 * location sidebar stays empty (no ingress) — unsafe scheme is on edit-url.
 */
export const urlSecurityExtraServices = [
  makeService({
    name: 'unsafe-scheme-plaintext',
    uid: 'url-security-svc-unsafe-0002',
  }),
  makeService({
    name: 'bad-edit-url-fallback',
    uid: 'url-security-svc-bad-edit-0003',
  }),
  makeService({
    name: 'invalid-git-uri',
    uid: 'url-security-svc-invalid-git-0004',
  }),
  makeService({
    name: 'long-git-url',
    uid: 'url-security-svc-long-git-0005',
  }),
];

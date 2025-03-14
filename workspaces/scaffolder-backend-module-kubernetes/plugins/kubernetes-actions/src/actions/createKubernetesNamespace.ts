/*
 * Copyright 2024 The Backstage Authors
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
import { CatalogClient } from '@backstage/catalog-client';
import type { Entity } from '@backstage/catalog-model';
import {
  createTemplateAction,
  type ActionContext,
} from '@backstage/plugin-scaffolder-node';

import {
  CoreV1Api,
  CoreV1ApiCreateNamespaceRequest,
  KubeConfig,
} from '@kubernetes/client-node';

const KUBERNETES_API_URL_ANNOTATION = 'kubernetes.io/api-server';
const KUBERNETES_CLUSTER_TYPE = 'kubernetes-cluster';

export interface HttpErrorBody {
  kind: string;
  apiVersion: string;
  metadata: Object;
  status: string;
  message: string;
  reason: string;
  details: { name: string; kind: string };
  code: number;
}

type TemplateActionParameters = {
  namespace: string;
  clusterRef?: string;
  url?: string;
  token: string;
  skipTLSVerify?: boolean;
  caData?: string;
  labels?: string;
};

const getUrlFromClusterRef = async (
  ctx: ActionContext<TemplateActionParameters>,
  catalogClient: CatalogClient,
  clusterRef: string,
): Promise<string> => {
  const isResource = clusterRef.startsWith('resource:');
  if (!isResource) {
    ctx.logger.warn(
      'Cluster reference in the wrong format, attempting to fix it',
    );
  }
  const catalogEntity: Entity | undefined = await catalogClient.getEntityByRef(
    isResource ? clusterRef : `resource:${clusterRef}`,
  );
  if (!catalogEntity) {
    throw new Error('Resource not found');
  }
  if (catalogEntity.spec?.type !== KUBERNETES_CLUSTER_TYPE) {
    ctx.logger.warn(`Resource is not of ${KUBERNETES_CLUSTER_TYPE} type`);
  }
  const apiUrl =
    catalogEntity.metadata?.annotations?.[KUBERNETES_API_URL_ANNOTATION];
  if (!apiUrl) {
    throw new Error(
      `Cluster resource is missing ${KUBERNETES_API_URL_ANNOTATION} annotation`,
    );
  }
  return apiUrl;
};

const validateUrl = (url: string | undefined = '') => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (error) {
    throw new Error(`"${url}" is an invalid url`);
  }
};

export const convertLabelsToObject = (
  labelsString: string | undefined,
): { [key: string]: string } => {
  const result: { [key: string]: string } = {};

  if (!labelsString || labelsString.indexOf('=') === -1) {
    console.error(
      "Invalid label string. Label string must contain at least one label separated by '=' character.",
    );
    return result;
  }

  const labelsArray = labelsString.split(';');

  labelsArray.forEach(label => {
    const separatorIndex = label.indexOf('=');
    if (separatorIndex !== -1) {
      const key = label.slice(0, separatorIndex).trim();
      const value = label.slice(separatorIndex + 1).trim();
      if (key && value) {
        result[key] = value;
      }
    } else {
      console.error(
        `Invalid label: '${label}'. Label must contain at least one '=' character.`,
      );
    }
  });

  return result;
};

export function createKubernetesNamespaceAction(catalogClient: CatalogClient) {
  return createTemplateAction<TemplateActionParameters>({
    id: 'kubernetes:create-namespace',
    description: 'Creates a kubernetes namespace',
    schema: {
      input: {
        type: 'object',
        oneOf: [
          { required: ['namespace', 'token', 'url'] },
          { required: ['namespace', 'token', 'clusterRef'] },
        ],
        properties: {
          namespace: {
            title: 'Namespace name',
            description: 'Name of the namespace to be created',
            type: 'string',
          },
          clusterRef: {
            title: 'Cluster entity reference',
            description: 'Cluster resource entity reference from the catalog',
            type: 'string',
          },
          url: {
            title: 'Url',
            description:
              'Url of the kubernetes API, will be used if clusterRef is not provided',
            type: 'string',
          },
          token: {
            title: 'Token',
            description: 'Bearer token to authenticate with',
            type: 'string',
          },
          skipTLSVerify: {
            title: 'Skip TLS verification',
            description:
              'Skip TLS certificate verification, not recommended to use in production environment, defaults to false',
            type: 'boolean',
          },
          caData: {
            title: 'CA Data',
            description: 'Certificate Authority base64 encoded certificate',
            type: 'string',
          },
          labels: {
            title: 'Labels',
            description: 'Labels that will be applied to the namespace.',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const {
        namespace,
        clusterRef,
        token,
        url,
        skipTLSVerify,
        caData,
        labels,
      } = ctx.input;
      const kubeConfig = new KubeConfig();
      const name = 'backstage';
      const cluster = {
        server: '',
        name,
        serviceAccountToken: token,
        skipTLSVerify: skipTLSVerify || false,
        caData,
      };

      if (clusterRef && url) {
        throw new Error(
          "Cluster reference and url can't be specified at the same time",
        );
      }

      if (!clusterRef && !url) {
        throw new Error('Cluster reference or url are required');
      }

      if (clusterRef) {
        cluster.server = await getUrlFromClusterRef(
          ctx,
          catalogClient,
          clusterRef,
        );
      } else {
        validateUrl(url);
        cluster.server = url!;
      }

      kubeConfig.loadFromOptions({
        clusters: [cluster],
        users: [{ name, token }],
        contexts: [
          {
            name,
            user: name,
            cluster: name,
          },
        ],
        currentContext: name,
      });

      const namespaceLabels = convertLabelsToObject(labels);

      const api = kubeConfig.makeApiClient(CoreV1Api);
      const k8sNamespace: CoreV1ApiCreateNamespaceRequest = {
        body: {
          metadata: {
            name: namespace,
            labels: namespaceLabels,
          },
        },
      };
      await api.createNamespace(k8sNamespace).catch((e: Error) => {
        // e.body should be string or blob binary
        if ('body' in e && typeof e.body === 'string') {
          let body: HttpErrorBody | undefined;
          try {
            body = JSON.parse(e.body);
          } catch (error) {
            /* eslint-disable-line no-empty */
          }
          if (body) {
            throw new Error(
              `Failed to create kubernetes namespace, API code: ${body.code} -- ${body.message}`,
            );
          }
        }

        throw new Error(`Failed to create kubernetes namespace, ${e.message}`);
      });
    },
  });
}

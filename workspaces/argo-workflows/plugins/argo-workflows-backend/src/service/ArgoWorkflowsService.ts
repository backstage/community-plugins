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

import type {
  BackstageCredentials,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import {
  InputError,
  NotFoundError,
  ServiceUnavailableError,
  ForwardedError,
} from '@backstage/errors';
import {
  parseWorkflow,
  type Workflow,
} from '@backstage-community/plugin-argo-workflows-common';
import type {
  KubernetesClustersSupplier,
  KubernetesFetcher,
  CustomResource,
  ClusterDetails,
  AuthenticationStrategy,
  KubernetesCredential,
} from '@backstage/plugin-kubernetes-node';
import fetch from 'node-fetch';

/** Instance configured to talk to the Argo Workflows server API. */
interface ArgoApiInstance {
  kind: 'argo-server';
  name: string;
  baseUrl: string;
  token: string;
}

/** Instance that resolves via the Backstage Kubernetes plugin. */
interface KubernetesClusterInstance {
  kind: 'kubernetes';
  name: string;
  clusterName: string;
}

type ArgoInstance = ArgoApiInstance | KubernetesClusterInstance;

const LABEL_KEY_PATTERN =
  '([a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\\.[a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\/)?[a-zA-Z_]([a-zA-Z0-9._-]*[a-zA-Z0-9_])?';
const LABEL_VALUE_PATTERN = '[a-zA-Z0-9]([a-zA-Z0-9._-]{0,61}[a-zA-Z0-9])?';

const EQUALITY_EXPR = new RegExp(
  `^${LABEL_KEY_PATTERN}\\s*(==?|!=)\\s*${LABEL_VALUE_PATTERN}$`,
);
const SET_EXPR = new RegExp(
  `^${LABEL_KEY_PATTERN}\\s+(in|notin)\\s+\\(\\s*${LABEL_VALUE_PATTERN}(\\s*,\\s*${LABEL_VALUE_PATTERN})*\\s*\\)$`,
);
const EXISTS_EXPR = new RegExp(`^!?${LABEL_KEY_PATTERN}$`);

function isValidSelectorExpression(expr: string): boolean {
  const trimmed = expr.trim();
  if (trimmed.length === 0) return false;
  return (
    EQUALITY_EXPR.test(trimmed) ||
    SET_EXPR.test(trimmed) ||
    EXISTS_EXPR.test(trimmed)
  );
}

function splitSelectorExpressions(selector: string): string[] {
  const expressions: string[] = [];
  let current = '';
  let depth = 0;
  for (const ch of selector) {
    if (ch === '(') {
      depth++;
      current += ch;
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
    } else if (ch === ',' && depth === 0) {
      expressions.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.length > 0) expressions.push(current);
  return expressions;
}

/**
 * Validates a full Kubernetes label selector string.
 * Returns an error message if invalid, or undefined if valid.
 */
export function validateLabelSelector(selector: string): string | undefined {
  if (selector.trim().length === 0) {
    return 'le sélecteur ne peut pas être vide';
  }
  const expressions = splitSelectorExpressions(selector);
  const invalid = expressions.filter(e => !isValidSelectorExpression(e));
  if (invalid.length > 0) {
    return `expressions invalides : ${invalid
      .map(e => `"${e.trim()}"`)
      .join(', ')}`;
  }
  return undefined;
}

const WORKFLOW_CUSTOM_RESOURCE: CustomResource = {
  objectType: 'customresources',
  group: 'argoproj.io',
  apiVersion: 'v1alpha1',
  plural: 'workflows',
};

/**
 * Options for constructing the ArgoWorkflowsService.
 *
 * @public
 */
export interface ArgoWorkflowsServiceOptions {
  config: RootConfigService;
  logger: LoggerService;
  /** Optional — required when any instance uses `kubernetes.clusterName`. */
  clusterSupplier?: KubernetesClustersSupplier;
  /** Optional — required when any instance uses `kubernetes.clusterName`. */
  fetcher?: KubernetesFetcher;
  /** Optional — required when any instance uses `kubernetes.clusterName`. */
  authStrategy?: AuthenticationStrategy;
}

/**
 * Service that communicates with Argo Workflows server instances or
 * queries Workflow CRDs via the Backstage Kubernetes plugin infrastructure.
 *
 * Each configured instance can use either:
 * - The Argo Workflows server API (`baseUrl` + `token`), or
 * - The Backstage Kubernetes plugin (`kubernetes.clusterName`)
 *
 * When no namespace is provided, queries are cluster-wide.
 * When a namespace is provided, queries are scoped to that namespace.
 */
export class ArgoWorkflowsService {
  private readonly instances: ArgoInstance[];
  private readonly defaultInstance: string | undefined;
  private readonly logger: LoggerService;
  private readonly clusterSupplier?: KubernetesClustersSupplier;
  private readonly fetcher?: KubernetesFetcher;
  private readonly authStrategy?: AuthenticationStrategy;

  constructor(options: ArgoWorkflowsServiceOptions) {
    this.logger = options.logger;
    this.clusterSupplier = options.clusterSupplier;
    this.fetcher = options.fetcher;
    this.authStrategy = options.authStrategy;
    this.instances = [];

    const argoConfig = options.config.getOptionalConfig('argoWorkflows');
    if (!argoConfig) {
      this.defaultInstance = undefined;
      this.logger.warn(
        'Aucune configuration argoWorkflows trouvée dans app-config.yaml',
      );
      return;
    }

    this.defaultInstance = argoConfig.getOptionalString('defaultInstance');

    const instanceConfigs = argoConfig.getOptionalConfigArray('instances');
    if (!instanceConfigs || instanceConfigs.length === 0) {
      this.logger.warn(
        'Aucune instance Argo Workflows configurée dans argoWorkflows.instances',
      );
      return;
    }

    for (const instanceConfig of instanceConfigs) {
      const name = instanceConfig.getString('name');
      const k8sConfig = instanceConfig.getOptionalConfig('kubernetes');

      if (k8sConfig) {
        this.instances.push({
          kind: 'kubernetes',
          name,
          clusterName: k8sConfig.getString('clusterName'),
        });
      } else {
        this.instances.push({
          kind: 'argo-server',
          name,
          baseUrl: instanceConfig.getString('baseUrl'),
          token: instanceConfig.getString('token'),
        });
      }
    }
  }

  /** Returns the names of all configured instances. */
  getInstanceNames(): string[] {
    return this.instances.map(i => i.name);
  }

  /** Returns instance details (name + type) for all configured instances. */
  getInstanceDetails(): Array<{
    name: string;
    type: 'argo-server' | 'kubernetes';
  }> {
    return this.instances.map(i => ({
      name: i.name,
      type: i.kind === 'argo-server' ? 'argo-server' : 'kubernetes',
    }));
  }

  /** Returns the default instance name, if configured. */
  getDefaultInstance(): string | undefined {
    return this.defaultInstance;
  }

  /**
   * Lists workflows filtered by a label selector.
   *
   * @param instanceName - The name of the instance to query (empty for default)
   * @param labelSelector - A Kubernetes label selector string
   * @param namespace - Optional namespace to scope the query
   * @param credentials - Backstage credentials (required for Kubernetes path)
   */
  async listWorkflows(
    instanceName: string,
    labelSelector: string,
    namespace?: string,
    credentials?: BackstageCredentials,
  ): Promise<Workflow[]> {
    const instance = this.resolveInstance(instanceName);

    const validationError = validateLabelSelector(labelSelector);
    if (validationError) {
      throw new InputError(`Sélecteur de labels invalide : ${validationError}`);
    }

    if (instance.kind === 'kubernetes') {
      return this.listWorkflowsViaKubernetes(
        instance,
        labelSelector,
        namespace,
        credentials,
      );
    }

    return this.listWorkflowsViaArgo(instance, labelSelector, namespace);
  }

  /**
   * Gets a single workflow by namespace and name.
   *
   * @param instanceName - The name of the instance to query (empty for default)
   * @param namespace - The Kubernetes namespace of the workflow
   * @param name - The name of the workflow
   * @param credentials - Backstage credentials (required for Kubernetes path)
   */
  async getWorkflow(
    instanceName: string,
    namespace: string,
    name: string,
    credentials?: BackstageCredentials,
  ): Promise<Workflow> {
    const instance = this.resolveInstance(instanceName);

    if (instance.kind === 'kubernetes') {
      return this.getWorkflowViaKubernetes(
        instance,
        namespace,
        name,
        credentials,
      );
    }

    return this.getWorkflowViaArgo(instance, namespace, name);
  }

  private async listWorkflowsViaArgo(
    instance: ArgoApiInstance,
    labelSelector: string,
    namespace?: string,
  ): Promise<Workflow[]> {
    const nsPath = namespace ? `/${encodeURIComponent(namespace)}` : '';
    const url = `${
      instance.baseUrl
    }/api/v1/workflows${nsPath}?listOptions.labelSelector=${encodeURIComponent(
      labelSelector,
    )}`;

    const response = await this.fetchWithToken(
      instance.name,
      url,
      instance.token,
    );
    const body = (await response.json()) as Record<string, unknown>;
    const rawItems =
      (body.items as Record<string, unknown>[] | undefined) ?? [];

    return this.parseWorkflowItems(rawItems);
  }

  private async getWorkflowViaArgo(
    instance: ArgoApiInstance,
    namespace: string,
    name: string,
  ): Promise<Workflow> {
    const url = `${instance.baseUrl}/api/v1/workflows/${encodeURIComponent(
      namespace,
    )}/${encodeURIComponent(name)}`;

    const response = await this.fetchWithToken(
      instance.name,
      url,
      instance.token,
    );
    const body = (await response.json()) as Record<string, unknown>;

    try {
      return parseWorkflow(body);
    } catch (error) {
      throw new ForwardedError(
        'Réponse invalide du serveur Argo : champs manquants',
        error,
      );
    }
  }

  private async listWorkflowsViaKubernetes(
    instance: KubernetesClusterInstance,
    labelSelector: string,
    namespace?: string,
    credentials?: BackstageCredentials,
  ): Promise<Workflow[]> {
    const { clusterDetails, credential } = await this.resolveCluster(
      instance,
      credentials,
    );

    const result = await this.fetcher!.fetchObjectsForService({
      serviceId: instance.name,
      clusterDetails,
      credential,
      objectTypesToFetch: new Set(),
      customResources: [WORKFLOW_CUSTOM_RESOURCE],
      labelSelector,
      namespace,
    });

    if (result.errors.length > 0) {
      const errorMessages = result.errors
        .map(e => ('message' in e ? e.message : String(e.errorType)))
        .join('; ');
      throw new ForwardedError(
        `Erreur lors de la récupération des CRDs Workflow : ${errorMessages}`,
        new Error(errorMessages),
      );
    }

    const rawItems: Record<string, unknown>[] = [];
    for (const resp of result.responses) {
      if (resp.type === 'customresources' && Array.isArray(resp.resources)) {
        for (const resource of resp.resources) {
          rawItems.push(resource as Record<string, unknown>);
        }
      }
    }

    return this.parseWorkflowItems(rawItems);
  }

  private async getWorkflowViaKubernetes(
    instance: KubernetesClusterInstance,
    namespace: string,
    name: string,
    credentials?: BackstageCredentials,
  ): Promise<Workflow> {
    // Fetch all workflows in the namespace and filter by name,
    // since the fetcher doesn't support single-resource GET.
    const workflows = await this.listWorkflowsViaKubernetes(
      instance,
      `metadata.name=${name}`,
      namespace,
      credentials,
    );

    const workflow = workflows.find(w => w.metadata.name === name);
    if (!workflow) {
      throw new NotFoundError(`Workflow '${namespace}/${name}' non trouvé`);
    }

    return workflow;
  }

  private async resolveCluster(
    instance: KubernetesClusterInstance,
    credentials?: BackstageCredentials,
  ): Promise<{
    clusterDetails: ClusterDetails;
    credential: KubernetesCredential;
  }> {
    if (!this.clusterSupplier || !this.fetcher || !this.authStrategy) {
      throw new ServiceUnavailableError(
        `L'instance '${instance.name}' utilise kubernetes.clusterName mais le plugin Kubernetes n'est pas configuré`,
      );
    }

    if (!credentials) {
      throw new InputError(
        'Les credentials Backstage sont requises pour les instances Kubernetes',
      );
    }

    const clusters = await this.clusterSupplier.getClusters({ credentials });
    const clusterDetails = clusters.find(c => c.name === instance.clusterName);

    if (!clusterDetails) {
      throw new NotFoundError(
        `Cluster Kubernetes '${instance.clusterName}' non trouvé`,
      );
    }

    const credential = await this.authStrategy.getCredential(
      clusterDetails,
      {},
    );

    return { clusterDetails, credential };
  }

  private resolveInstance(instanceName: string): ArgoInstance {
    if (this.instances.length === 0) {
      throw new ServiceUnavailableError(
        'Aucune instance Argo Workflows configurée',
      );
    }

    const targetName = instanceName || this.defaultInstance;

    if (!targetName) {
      throw new InputError(
        "Aucun nom d'instance fourni et aucune instance par défaut configurée",
      );
    }

    const instance = this.instances.find(i => i.name === targetName);
    if (!instance) {
      throw new NotFoundError(
        `Instance Argo Workflows '${targetName}' non trouvée`,
      );
    }

    return instance;
  }

  private parseWorkflowItems(rawItems: Record<string, unknown>[]): Workflow[] {
    return rawItems.map(raw => {
      try {
        return parseWorkflow(raw);
      } catch (error) {
        throw new ForwardedError(
          'Réponse invalide : champs manquants dans le Workflow',
          error,
        );
      }
    });
  }

  /**
   * Performs an authenticated HTTP GET request with a bearer token.
   * Used for Argo API calls.
   */
  private async fetchWithToken(
    instanceName: string,
    url: string,
    token: string,
  ): Promise<{ json(): Promise<unknown> }> {
    let response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      this.logger.error(`Erreur de connexion (${instanceName}): ${error}`);
      throw new ForwardedError('Le serveur est indisponible', error);
    }

    if (!response.ok) {
      const statusCode = response.status;
      this.logger.error(`Erreur HTTP ${statusCode} (${instanceName}): ${url}`);
      const err = new Error(`Erreur du serveur (HTTP ${statusCode})`);
      (err as any).statusCode = statusCode;
      throw err;
    }

    return response;
  }
}

import {
  AuthService,
  BackstageCredentials,
  DiscoveryService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { ResponseError } from '@backstage/errors';
import qs from 'qs';
import fetch from 'node-fetch';
import { StatsResponse, EdgesResponse } from '../types';
import { processStats } from './metricsUtils';

export class LinkerdVizClient {
  private constructor(
    private readonly discoveryApi: DiscoveryService,
    private readonly authApi: AuthService,
    private readonly configApi: RootConfigService,
  ) {}

  static fromConfig({
    discovery,
    auth,
    config,
  }: {
    discovery: DiscoveryService;
    auth: AuthService;
    config: RootConfigService;
  }) {
    return new LinkerdVizClient(discovery, auth, config);
  }

  async request<T = any>(
    url: string,
    options: { credentials: BackstageCredentials },
  ) {
    const k8sBase = await this.discoveryApi.getBaseUrl('kubernetes');

    const targetUrl = this.configApi.getOptionalBoolean(
      'linkerd.deployedWithControlPlane',
    )
      ? 'http://web.linkerd-viz.svc.cluster.local:8084/proxy'
      : `${k8sBase}/proxy/api/v1/namespaces/linkerd-viz/services/web:8084/proxy${url}`;

    const { token } = await this.authApi.getPluginRequestToken({
      onBehalfOf: options.credentials,
      targetPluginId: 'kubernetes',
    });

    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }

  async stats(
    opts: {
      namespace?: string;
      resourceType: string;
      resourceName?: string;
      allNamespaces?: boolean;
      fromName?: string;
      toName?: string;
      toNamespace?: string;
      fromNamespace?: string;
      toType?: string;
      fromType?: string;
    },
    { credentials }: { credentials: BackstageCredentials },
  ) {
    const defaultOptions = {
      tcp_stats: true,
      window: '30s',
    };

    const options: Record<string, unknown> = {
      resource_type: opts.resourceType,
      ...defaultOptions,
    };

    if (opts.namespace) {
      options.namespace = opts.namespace;
    }

    if (opts.toName) {
      options.to_name = opts.toName;
    }

    if (opts.toNamespace) {
      options.to_namespace = opts.toNamespace;
    }

    if (opts.resourceName) {
      options.resource_name = opts.resourceName;
    }

    if (opts.toType) {
      options.to_type = opts.toType;
    }

    if (opts.fromName) {
      options.from_name = opts.fromName;
    }

    if (opts.fromNamespace) {
      options.from_namespace = opts.fromNamespace;
    }

    if (opts.fromType) {
      options.from_type = opts.fromType;
    }

    if (opts.allNamespaces) {
      options.all_namespaces = true;
    }

    const stats = await this.request<StatsResponse>(
      `/api/tps-reports?${qs.stringify(options)}`,
      {
        credentials,
      },
    );

    if (!stats.ok) {
      throw new Error('Failed to fetch stats');
    }

    return processStats(stats);
  }

  async edges(
    opts: { namespace: string; resourceType: string },
    { credentials }: { credentials: BackstageCredentials },
  ) {
    const options = {
      namespace: opts.namespace,
      resource_type: opts.resourceType,
    };

    const edges = await this.request<EdgesResponse>(
      `/api/edges?${qs.stringify(options)}`,
      {
        credentials,
      },
    );

    if (!edges.ok) {
      throw new Error('Failed to fetch edges');
    }

    return edges.ok.edges;
  }
}

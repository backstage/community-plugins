import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
  ConfigApi,
} from '@backstage/core-plugin-api';
import type { FrictionData } from './types';

/**
 * The Healert API ref — used for dependency injection via Backstage's
 * ApiProvider system.
 */
/** @public */
export const healertApiRef = createApiRef<HealertApi>({
  id: 'plugin.healert.service',
});

/** Contract for the Healert API client */
/** @public */
export interface HealertApi {
  getFrictionData(entityRef: string): Promise<FrictionData>;
}

/**
 * Default implementation of HealertApi.
 *
 * URL resolution order:
 *  1. healert.baseUrl in app-config.yaml (direct backend URL)
 *  2. Backstage proxy at /api/proxy/healert/api (default)
 *
 * Self-hosted setup (app-config.yaml):
 *   proxy:
 *     endpoints:
 *       '/healert/api':
 *         target: 'http://your-healert-backend:8000'
 */
/** @public */
export class HealertClient implements HealertApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly configApi: ConfigApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    configApi: ConfigApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.configApi = options.configApi;
  }

  private async getBaseUrl(): Promise<string> {
    // Option 1: explicit baseUrl in config
    try {
      const baseUrl = this.configApi.getString('healert.baseUrl');
      if (baseUrl) return baseUrl;
    } catch {
      // Not set — fall through to proxy
    }

    // Option 2: Backstage proxy (default)
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}/healert/api`;
  }

  async getFrictionData(entityRef: string): Promise<FrictionData> {
    const baseUrl = await this.getBaseUrl();
    const encodedRef = encodeURIComponent(entityRef);
    const url = `${baseUrl}/friction/${encodedRef}`;

    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw new Error(
        `Healert API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}

/**
 * Mock implementation for development and testing.
 * Returns realistic-looking data without requiring a live backend.
 */
/** @public */
export class MockHealertClient implements HealertApi {
  async getFrictionData(entityRef: string): Promise<FrictionData> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const score = Math.floor(Math.random() * 60) + 30;
    const severity =
      score >= 80
        ? 'critical'
        : score >= 60
        ? 'high'
        : score >= 40
        ? 'medium'
        : 'low';

    return {
      entityRef,
      frictionScore: {
        score,
        severity,
        bypassCount: Math.floor(score / 6),
        overheadHoursPerEngineer: parseFloat((score / 40).toFixed(1)),
        topFrictionWorkflow: 'deploy',
        calculatedAt: new Date().toISOString(),
      },
      recentEvents: [
        {
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          actor: 'platform-team',
          type: 'kubectl-exec',
          description: 'kubectl exec into prod namespace — bypassed ArgoCD',
          workflow: 'deploy',
        },
        {
          timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
          actor: 'auth-team',
          type: 'pipeline-skip',
          description: 'Skipped security scan in CI pipeline',
          workflow: 'deploy',
        },
        {
          timestamp: new Date(Date.now() - 23 * 60000).toISOString(),
          actor: 'data-team',
          type: 'platform-ticket',
          description: 'Manual DB provisioning request via Jira',
          workflow: 'provision',
        },
      ],
      sources: {
        kubernetesAuditLog: true,
        github: false,
        jira: false,
      },
      fetchedAt: new Date().toISOString(),
    };
  }
}

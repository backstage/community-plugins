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
import { LoggerService } from '@backstage/backend-plugin-api';
import * as fs from 'fs';
import {
  MAX_TOKEN_CACHE_SIZE,
  MIN_TOKEN_LIFETIME_S,
  TOKEN_EXPIRY_BUFFER_S,
  DEFAULT_TOKEN_EXPIRATION_S,
  TOKEN_EXCHANGE_TIMEOUT_MS,
} from '../../constants';
import { fetchWithTlsControl } from '../../services/utils/http';
import { toErrorMessage } from '../../services/utils';
import {
  MCPAuthConfig,
  MCPServerConfig,
  MCPServerOAuthConfig,
  MCPServerServiceAccountConfig,
  SecurityConfig,
} from '../../types';
import { getApiApprovalConfig } from './McpConfigLoader';

/**
 * Token cache entry
 */
interface TokenCacheEntry {
  token: string;
  expiresAt: number;
}

/**
 * MCP Authentication Service
 *
 * Handles all authentication for MCP servers including:
 * - OAuth client credentials flow
 * - Kubernetes ServiceAccount tokens
 * - Token caching with expiry
 */
export class McpAuthService {
  private readonly securityConfig: SecurityConfig;
  private readonly mcpAuthConfigs: Map<string, MCPAuthConfig>;
  private readonly logger: LoggerService;
  private readonly skipTlsVerify: boolean;

  /**
   * Token caches - separated by token type for different TTL handling
   * OAuth tokens typically expire in 5-60 minutes
   * ServiceAccount tokens typically expire in 1 hour
   */
  private readonly oauthTokenCache: Map<string, TokenCacheEntry> = new Map();
  private readonly serviceAccountTokenCache: Map<string, TokenCacheEntry> =
    new Map();

  // In-flight token request deduplication: if a token fetch is already in
  // progress for a given key, subsequent callers receive the same promise
  // instead of issuing a duplicate request to the token endpoint.
  private readonly inflightTokenRequests: Map<string, Promise<string | null>> =
    new Map();

  // Global security.mcpOAuth token (used in 'full' mode)
  private mcpOAuthToken: string | null = null;
  private mcpOAuthTokenExpiry: number | null = null;

  constructor(
    securityConfig: SecurityConfig,
    mcpAuthConfigs: Map<string, MCPAuthConfig>,
    logger: LoggerService,
    skipTlsVerify: boolean = false,
  ) {
    this.securityConfig = securityConfig;
    this.mcpAuthConfigs = mcpAuthConfigs;
    this.logger = logger;
    this.skipTlsVerify = skipTlsVerify;
  }

  private evictExpiredEntries(cache: Map<string, TokenCacheEntry>): void {
    if (cache.size <= MAX_TOKEN_CACHE_SIZE) return;
    const now = Date.now();
    for (const [key, entry] of cache) {
      if (entry.expiresAt <= now) {
        cache.delete(key);
      }
    }
    if (cache.size > MAX_TOKEN_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }
  }

  private fetchWithTlsControl(
    url: string,
    options: { method: string; headers: Record<string, string>; body: string },
  ) {
    return fetchWithTlsControl(url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      skipTlsVerify: this.skipTlsVerify,
    });
  }

  /**
   * Get headers for an MCP server, including auth token if configured
   * Supports: authRef (named config), oauth (inline), serviceAccount
   */
  async getServerHeaders(
    server: MCPServerConfig,
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = { ...server.headers };

    // Priority: authRef > inline oauth > inline serviceAccount > security.mcpOAuth (full mode)

    // 1. Check for authRef (reference to named config)
    if (server.authRef) {
      const authConfig = this.mcpAuthConfigs.get(server.authRef);
      if (!authConfig) {
        this.logger.warn(
          `MCP server ${server.id} references unknown auth config: ${server.authRef}`,
        );
      } else if (authConfig.type === 'oauth') {
        const token = await this.getOAuthToken(server.id, authConfig);
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else {
          this.logger.warn(
            `MCP server ${server.id}: OAuth token via authRef "${server.authRef}" returned null — requests will be unauthenticated`,
          );
        }
      } else if (authConfig.type === 'serviceAccount') {
        const token = await this.getServiceAccountToken(server.id, authConfig);
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else {
          this.logger.warn(
            `MCP server ${server.id}: ServiceAccount token via authRef "${server.authRef}" returned null — requests will be unauthenticated`,
          );
        }
      }
      return headers;
    }

    // 2. Check for inline OAuth config
    if (server.oauth) {
      const token = await this.getOAuthToken(server.id, server.oauth);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        this.logger.warn(
          `MCP server ${server.id}: inline OAuth token returned null — requests will be unauthenticated`,
        );
      }
      return headers;
    }

    // 3. Check for inline ServiceAccount config
    if (server.serviceAccount) {
      const token = await this.getServiceAccountToken(
        server.id,
        server.serviceAccount,
      );
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        this.logger.warn(
          `MCP server ${server.id}: ServiceAccount token returned null — requests will be unauthenticated`,
        );
      }
      return headers;
    }

    // 4. Use global security.mcpOAuth if in 'full' mode
    if (this.securityConfig.mode === 'full' && this.securityConfig.mcpOAuth) {
      const token = await this.getSecurityMcpOAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        this.logger.debug(
          `MCP server ${server.id} using global security.mcpOAuth token`,
        );
      } else {
        this.logger.warn(
          `MCP server ${server.id}: global security.mcpOAuth token returned null — requests will be unauthenticated`,
        );
      }
      return headers;
    }

    return headers;
  }

  /**
   * Convert MCPServerConfig's requireApproval to Llama Stack API format.
   * Delegates to McpConfigLoader.
   */
  getApiApprovalConfig(
    configApproval: Parameters<typeof getApiApprovalConfig>[0],
  ): ReturnType<typeof getApiApprovalConfig> {
    return getApiApprovalConfig(configApproval, this.logger);
  }

  /**
   * Fetch OAuth token for an MCP server using client credentials grant.
   * Tokens are cached until they expire (with a 60s buffer).
   * Concurrent requests for the same server share a single in-flight fetch
   * to avoid duplicate token endpoint calls.
   */
  private async getOAuthToken(
    serverId: string,
    oauth: MCPServerOAuthConfig,
  ): Promise<string | null> {
    if (!oauth) {
      return null;
    }

    // Check cache first (no lock needed — cache hit is synchronous)
    const cached = this.oauthTokenCache.get(serverId);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.debug(`Using cached OAuth token for MCP server ${serverId}`);
      return cached.token;
    }

    // Deduplicate: if a fetch is already in-flight for this server, await it
    const inflightKey = `oauth:${serverId}`;
    const inflight = this.inflightTokenRequests.get(inflightKey);
    if (inflight) {
      this.logger.debug(
        `Awaiting in-flight OAuth token request for ${serverId}`,
      );
      return inflight;
    }

    const request = this.fetchOAuthToken(serverId, oauth);
    this.inflightTokenRequests.set(inflightKey, request);

    try {
      return await request;
    } finally {
      this.inflightTokenRequests.delete(inflightKey);
    }
  }

  /**
   * Fetch OAuth token using client credentials grant.
   * Shared by per-server OAuth and global security.mcpOAuth.
   * @returns { token, expiresIn } on success
   * @throws on HTTP error or network/parse failure
   */
  private async fetchOAuthClientCredentials(
    url: string,
    clientId: string,
    clientSecret: string,
    scopes: string[],
  ): Promise<{ token: string; expiresIn: number }> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scopes.join(' '),
    });

    const response = await this.fetchWithTlsControl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OAuth token request failed: HTTP ${response.status}${
          errorText ? ` - ${errorText}` : ''
        }`,
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in?: number;
    };
    const token = data.access_token;
    const expiresIn = data.expires_in || MIN_TOKEN_LIFETIME_S;
    return { token, expiresIn };
  }

  private async fetchOAuthToken(
    serverId: string,
    oauth: MCPServerOAuthConfig,
  ): Promise<string | null> {
    try {
      this.logger.info(`Fetching OAuth token for MCP server ${serverId}`);

      const scopes = oauth.scopes || ['openid'];
      const result = await this.fetchOAuthClientCredentials(
        oauth.tokenUrl,
        oauth.clientId,
        oauth.clientSecret,
        scopes,
      );

      const { token, expiresIn } = result;
      this.evictExpiredEntries(this.oauthTokenCache);
      this.oauthTokenCache.set(serverId, {
        token,
        expiresAt: Date.now() + (expiresIn - TOKEN_EXPIRY_BUFFER_S) * 1000,
      });

      this.logger.info(
        `OAuth token obtained for ${serverId}, expires in ${expiresIn}s`,
      );
      return token;
    } catch (error) {
      this.logger.error(
        `Failed to fetch OAuth token for ${serverId}: ${toErrorMessage(error)}`,
      );
      return null;
    }
  }

  /**
   * Get a ServiceAccount token from the cluster
   * Reads from the mounted token file or creates a token via Kubernetes API
   */
  private async getServiceAccountToken(
    serverId: string,
    saConfig: MCPServerServiceAccountConfig,
  ): Promise<string | null> {
    // Check cache first (uses separate cache from OAuth tokens)
    const cacheKey = `${saConfig.namespace || 'default'}/${saConfig.name}`;
    const cached = this.serviceAccountTokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.debug(`Using cached ServiceAccount token for ${serverId}`);
      return cached.token;
    }

    try {
      // Path to the mounted ServiceAccount token (if running in-cluster)
      // When a pod references a specific ServiceAccount, we can create a token for it
      const inClusterTokenPath =
        '/var/run/secrets/kubernetes.io/serviceaccount/token';

      // Check if we're running in-cluster with the default SA token
      if (fs.existsSync(inClusterTokenPath)) {
        // If the requested SA matches the pod's SA, use the mounted token
        const namespaceFile =
          '/var/run/secrets/kubernetes.io/serviceaccount/namespace';
        const podNamespace = fs.existsSync(namespaceFile)
          ? (await fs.promises.readFile(namespaceFile, 'utf8')).trim()
          : 'default';

        const requestedNamespace = saConfig.namespace || podNamespace;

        // For now, we'll use the in-cluster token and create a TokenRequest
        // This requires the pod's SA to have permission to create tokens for other SAs
        this.logger.info(
          `Getting ServiceAccount token for ${requestedNamespace}/${saConfig.name}`,
        );

        // Use the Kubernetes API to create a token for the specified ServiceAccount
        const k8sHost = process.env.KUBERNETES_SERVICE_HOST;
        const k8sPort = process.env.KUBERNETES_SERVICE_PORT;

        if (k8sHost && k8sPort) {
          const podToken = (
            await fs.promises.readFile(inClusterTokenPath, 'utf8')
          ).trim();

          // Create a TokenRequest for the target ServiceAccount
          const tokenRequestUrl = `https://${k8sHost}:${k8sPort}/api/v1/namespaces/${requestedNamespace}/serviceaccounts/${saConfig.name}/token`;

          const tokenRequest = {
            apiVersion: 'authentication.k8s.io/v1',
            kind: 'TokenRequest',
            spec: {
              audiences: ['mcp-server'], // Request token for MCP server audience
              expirationSeconds: DEFAULT_TOKEN_EXPIRATION_S,
            },
          };

          const response = await fetch(tokenRequestUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${podToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tokenRequest),
            signal: AbortSignal.timeout(15_000),
          });

          if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(
              `Failed to create token for ServiceAccount ${requestedNamespace}/${saConfig.name}: ${response.status} ${errorText}`,
            );
            return null;
          }

          const data = (await response.json()) as {
            status: { token: string; expirationTimestamp: string };
          };
          const token = data.status.token;

          // Cache the token in ServiceAccount cache (with buffer before expiry)
          const expiresAt =
            new Date(data.status.expirationTimestamp).getTime() -
            TOKEN_EXPIRY_BUFFER_S * 1000;
          this.evictExpiredEntries(this.serviceAccountTokenCache);
          this.serviceAccountTokenCache.set(cacheKey, { token, expiresAt });

          this.logger.info(
            `ServiceAccount token obtained for ${requestedNamespace}/${saConfig.name}`,
          );
          return token;
        }
      }

      this.logger.warn(
        `Cannot get ServiceAccount token for ${serverId}: not running in-cluster`,
      );
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get ServiceAccount token for ${serverId}: ${toErrorMessage(
          error,
        )}`,
      );
      return null;
    }
  }

  /**
   * Get OAuth token for MCP servers (used in 'full' security mode)
   * Uses the global mcpOAuth config from security settings
   */
  private async getSecurityMcpOAuthToken(): Promise<string | null> {
    if (this.securityConfig.mode !== 'full' || !this.securityConfig.mcpOAuth) {
      return null;
    }

    // Check token cache
    if (
      this.mcpOAuthToken &&
      this.mcpOAuthTokenExpiry &&
      Date.now() < this.mcpOAuthTokenExpiry - TOKEN_EXCHANGE_TIMEOUT_MS
    ) {
      return this.mcpOAuthToken;
    }

    // In-flight dedup: share a single token request across concurrent callers
    const inflightKey = 'security:mcpOAuth';
    const inflight = this.inflightTokenRequests.get(inflightKey);
    if (inflight) {
      this.logger.debug('Awaiting in-flight security mcpOAuth token request');
      return inflight;
    }

    const request = this.fetchSecurityMcpOAuthToken();
    this.inflightTokenRequests.set(inflightKey, request);

    try {
      return await request;
    } finally {
      this.inflightTokenRequests.delete(inflightKey);
    }
  }

  private async fetchSecurityMcpOAuthToken(): Promise<string | null> {
    const { tokenUrl, clientId, clientSecret, scopes } =
      this.securityConfig.mcpOAuth!;

    this.logger.info(`Fetching security OAuth token for MCP servers`);

    try {
      const result = await this.fetchOAuthClientCredentials(
        tokenUrl,
        clientId,
        clientSecret,
        scopes || ['openid'],
      );

      this.mcpOAuthToken = result.token;
      this.mcpOAuthTokenExpiry = Date.now() + result.expiresIn * 1000;

      this.logger.info(
        `Security OAuth token obtained, expires in ${result.expiresIn}s`,
      );

      return this.mcpOAuthToken;
    } catch (error) {
      this.logger.error(
        `Failed to get security OAuth token: ${toErrorMessage(error)}`,
      );
      return null;
    }
  }
}

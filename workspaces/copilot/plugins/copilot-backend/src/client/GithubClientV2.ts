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
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import {
  MetricsScope,
  ReportEnvelope,
} from '@backstage-community/plugin-copilot-common';
import {
  CopilotConfig,
  getCopilotConfig,
  getGithubCredentials,
} from '../utils/GithubUtils';

// GitHub serves user content from this domain on both github.com and GHE.com.
const GITHUB_USER_CONTENT_DOMAIN = 'githubusercontent.com';

// Object storage the signed report links can fall back to. GitHub documents the
// Azure Blob Storage fallback for github.com and GHE.com alike, so this list is
// not scoped to the configured host.
const STORAGE_DOWNLOAD_HOSTS = [
  /^[a-zA-Z0-9.-]+\.s3\.amazonaws\.com$/,
  /^[a-zA-Z0-9.-]+\.s3\.[a-z0-9-]+\.amazonaws\.com$/,
  /^[a-zA-Z0-9-]+\.blob\.core\.windows\.net$/,
];

// Follow at most this many redirects, re-checking the allowlist on every hop.
const MAX_DOWNLOAD_REDIRECTS = 5;

function isWithinDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

// `copilot.host` may carry a port, which URL.hostname never does.
function normalizeConfiguredHost(githubHost: string): string {
  try {
    return new URL(`https://${githubHost}`).hostname;
  } catch {
    return githubHost.toLowerCase();
  }
}

/**
 * SSRF guard for signed report download links. The allowed hosts are derived
 * from the configured GitHub host so that a github.com deployment never trusts
 * a GHE.com tenant, and vice versa.
 */
function isAllowedDownloadHost(url: URL, githubHost: string): boolean {
  const hostname = url.hostname.toLowerCase();
  const host = normalizeConfiguredHost(githubHost);

  // An empty host would make every domain check below match.
  if (!host) {
    return false;
  }

  if (
    isWithinDomain(hostname, host) ||
    isWithinDomain(hostname, GITHUB_USER_CONTENT_DOMAIN)
  ) {
    return true;
  }

  return STORAGE_DOWNLOAD_HOSTS.some(pattern => pattern.test(hostname));
}

export class GithubClientV2 {
  private enterpriseOctokit?: Octokit;
  private organizationOctokit?: Octokit;

  constructor(
    private readonly copilotConfig: CopilotConfig,
    private readonly config: Config,
    private readonly logger: LoggerService,
  ) {}

  static async fromConfig(
    config: Config,
    logger: LoggerService,
  ): Promise<GithubClientV2> {
    const info = getCopilotConfig(config);
    return new GithubClientV2(info, config, logger);
  }

  private async getOctokit(type: MetricsScope): Promise<Octokit> {
    const credentials = await getGithubCredentials(
      this.config,
      this.copilotConfig,
    );
    const authStrategy = credentials[type];

    if (!authStrategy) {
      throw new Error(
        `No credentials configured for ${type}. Please configure GitHub integration.`,
      );
    }

    const octokitConfig: ConstructorParameters<typeof Octokit>[0] = {
      baseUrl: this.copilotConfig.apiBaseUrl,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2026-03-10',
      },
    };

    if (typeof authStrategy === 'string') {
      octokitConfig.auth = authStrategy;
    } else {
      const appOctokit = new Octokit({
        baseUrl: this.copilotConfig.apiBaseUrl,
        authStrategy: createAppAuth,
        auth: {
          appId: authStrategy.appId,
          privateKey: authStrategy.privateKey,
        },
      });
      const orgName =
        type === 'organization'
          ? this.copilotConfig.organization
          : this.copilotConfig.enterprise;
      if (!orgName) {
        throw new Error(`No ${type} name configured.`);
      }
      const { data: installation } =
        await appOctokit.rest.apps.getOrgInstallation({ org: orgName });
      octokitConfig.authStrategy = createAppAuth;
      octokitConfig.auth = {
        appId: authStrategy.appId,
        privateKey: authStrategy.privateKey,
        installationId: installation.id,
      };
    }
    return new Octokit(octokitConfig);
  }

  private async getEnterpriseOctokit(): Promise<Octokit> {
    if (!this.enterpriseOctokit) {
      this.enterpriseOctokit = await this.getOctokit('enterprise');
    }
    return this.enterpriseOctokit;
  }

  private async getOrganizationOctokit(): Promise<Octokit> {
    if (!this.organizationOctokit) {
      this.organizationOctokit = await this.getOctokit('organization');
    }
    return this.organizationOctokit;
  }

  private async fetchReportLinks(
    octokit: Octokit,
    path: string,
  ): Promise<ReportEnvelope> {
    const response = await octokit.request(`GET ${path}`);

    if (response.status === 204 || !response.data) {
      this.logger.warn(
        `[GithubClientV2] Received status ${response.status} for ${path} — no report data available for this period.`,
      );
      return { download_links: [] };
    }

    const envelope = response.data as ReportEnvelope;
    if (!envelope.download_links?.length) {
      this.logger.warn(
        `[GithubClientV2] Empty download_links in response for ${path} — report may not yet be available.`,
      );
    }

    return envelope;
  }

  async fetchEnterpriseReportLinks(day: string): Promise<ReportEnvelope> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/metrics/reports/enterprise-1-day?day=${day}`;
    return this.fetchReportLinks(octokit, path);
  }

  async fetchOrganizationReportLinks(day: string): Promise<ReportEnvelope> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/copilot/metrics/reports/organization-1-day?day=${day}`;
    return this.fetchReportLinks(octokit, path);
  }

  async fetchEnterpriseUserReportLinks(day: string): Promise<ReportEnvelope> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/metrics/reports/users-1-day?day=${day}`;
    return this.fetchReportLinks(octokit, path);
  }

  async fetchOrganizationUserReportLinks(day: string): Promise<ReportEnvelope> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/copilot/metrics/reports/users-1-day?day=${day}`;
    return this.fetchReportLinks(octokit, path);
  }

  async fetchEnterpriseUserTeamsLinks(day: string): Promise<ReportEnvelope> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/metrics/reports/user-teams-1-day?day=${day}`;
    return this.fetchReportLinks(octokit, path);
  }

  async fetchOrganizationUserTeamsLinks(day: string): Promise<ReportEnvelope> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/copilot/metrics/reports/user-teams-1-day?day=${day}`;
    return this.fetchReportLinks(octokit, path);
  }

  /**
   * Download a signed document URL containing a JSON payload (array or object).
   * SSRF guard: only allows downloads from hosts derived from the configured
   * GitHub host, plus the documented object storage fallbacks.
   * Logs only origin+pathname (never query string which contains credentials).
   * Use for entity-level reports (enterprise-1-day, organization-1-day).
   */
  async downloadDocument(url: string): Promise<unknown> {
    const body = await this.downloadText(url);
    return JSON.parse(body);
  }

  /**
   * Download a signed document URL containing newline-delimited JSON (NDJSON).
   * Each non-empty line is a separate JSON object. Returns all parsed rows.
   * Use for per-user and user-teams reports which are NDJSON format.
   */
  async downloadNdjsonDocument(url: string): Promise<unknown[]> {
    const body = await this.downloadText(url);
    const rows: unknown[] = [];
    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        rows.push(JSON.parse(trimmed));
      } catch (err) {
        this.logger.warn(
          `[GithubClientV2] Skipping unparseable NDJSON line: ${err}`,
        );
      }
    }
    return rows;
  }

  /**
   * Parses a download URL and applies the SSRF guard. Called for the initial
   * URL and again for every redirect target, so a signed link on an allowed
   * host cannot bounce the download to an internal address.
   */
  private assertAllowedDownloadUrl(url: string): URL {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      // The URL carries a signature, so it must never reach the logs.
      throw new Error('Malformed download URL');
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new Error(
        `Refused to download over insecure protocol: ${parsedUrl.protocol}`,
      );
    }

    if (!isAllowedDownloadHost(parsedUrl, this.copilotConfig.host)) {
      throw new Error(
        `Refused to download from disallowed host: ${parsedUrl.hostname}`,
      );
    }

    return parsedUrl;
  }

  private async downloadText(url: string): Promise<string> {
    let currentUrl = url;

    for (let hop = 0; hop <= MAX_DOWNLOAD_REDIRECTS; hop++) {
      const { origin, pathname } = this.assertAllowedDownloadUrl(currentUrl);
      this.logger.debug(
        `[GithubClientV2] Downloading document: ${origin}${pathname}`,
      );

      const response = await fetch(currentUrl, { redirect: 'manual' });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error(
            `Failed to download document: HTTP ${response.status} ${response.statusText} without a location header`,
          );
        }
        // Drain the redirect body so undici can reuse the connection. A
        // truncated body must not fail a download whose target we already have.
        await response.text().catch(() => undefined);

        let nextUrl: URL;
        try {
          nextUrl = new URL(location, currentUrl);
        } catch {
          // Node attaches the base URL, which carries a signature, to the
          // thrown error, so none of it may reach the caller.
          throw new Error('Malformed redirect location');
        }

        currentUrl = nextUrl.toString();
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to download document: HTTP ${response.status} ${response.statusText}`,
        );
      }

      return response.text();
    }

    throw new Error(
      `Failed to download document: exceeded ${MAX_DOWNLOAD_REDIRECTS} redirects`,
    );
  }
}

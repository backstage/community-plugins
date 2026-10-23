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

import { GithubClientV2 } from './GithubClientV2';
import { Octokit } from '@octokit/rest';

const mockRequest = jest.fn();
const mockGetOrgInstallation = jest.fn();
const mockHookBefore = jest.fn();
const mockOutgoingHeaders: Array<Record<string, string>> = [];
const mockAppAuthentication = jest
  .fn()
  .mockResolvedValue({ token: 'fake-app-jwt' });
const mockCreateAppAuth = jest.fn((_options: unknown) => mockAppAuthentication);

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation((options: any) => {
    const requestHooks: Array<
      (requestOptions: { headers: Record<string, string> }) => void
    > = [];
    return {
      request: (...args: any[]) => {
        const requestOptions = {
          headers: {
            accept: 'application/vnd.github.v3+json',
          } as Record<string, string>,
        };
        requestHooks.forEach(requestHook => requestHook(requestOptions));
        mockOutgoingHeaders.push({ ...requestOptions.headers });
        return mockRequest(...args);
      },
      auth: jest.fn().mockResolvedValue({
        type: 'token',
        token:
          typeof options?.auth === 'string'
            ? options.auth
            : 'fake-installation-token',
      }),
      rest: {
        apps: {
          getOrgInstallation: mockGetOrgInstallation,
        },
      },
      hook: {
        before: (
          name: string,
          requestHook: (requestOptions: {
            headers: Record<string, string>;
          }) => void,
        ) => {
          mockHookBefore(name, requestHook);
          if (name === 'request') {
            requestHooks.push(requestHook);
          }
        },
      },
    };
  }),
}));

jest.mock('@octokit/auth-app', () => ({
  createAppAuth: (options: unknown) => mockCreateAppAuth(options),
}));

// Mock GithubUtils
jest.mock('../utils/GithubUtils', () => ({
  getCopilotConfig: jest.fn().mockReturnValue({
    host: 'github.com',
    enterprise: 'my-enterprise',
    organization: 'my-org',
    apiBaseUrl: 'https://api.github.com',
  }),
  getGithubCredentials: jest.fn().mockResolvedValue({
    enterprise: 'fake-token',
    organization: 'fake-token',
  }),
}));

function parseMockRequestUrl(route: string): URL {
  return new URL(route.replace(/^GET\s+/, ''), 'https://api.github.com');
}

function githubResponse(
  data: unknown,
  link?: string,
  headers: Record<string, string> = {},
) {
  return { data, headers: { ...headers, ...(link ? { link } : {}) } };
}

function rawFetchResponse(data: unknown, link?: string) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'link' ? link ?? null : null,
    },
    json: jest.fn().mockResolvedValue(data),
  };
}

function httpError(status: number): Error & { status: number } {
  return Object.assign(new Error(`HTTP ${status}`), { status });
}

describe('GithubClientV2', () => {
  let mockConfig: any;
  let mockLogger: any;
  let originalFetch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockReset();
    mockGetOrgInstallation.mockReset().mockResolvedValue({ data: { id: 999 } });
    mockHookBefore.mockReset();
    mockOutgoingHeaders.length = 0;
    mockAppAuthentication
      .mockReset()
      .mockResolvedValue({ token: 'fake-app-jwt' });
    mockCreateAppAuth.mockReset().mockReturnValue(mockAppAuthentication);
    mockConfig = {} as any;
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    // Mock global fetch
    originalFetch = (global as any).fetch;
    const mockFetch = jest.fn();
    (global as any).fetch = mockFetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('downloadDocument rejects disallowed hosts (SSRF guard)', async () => {
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    await expect(
      client.downloadDocument('https://internal.example.com/evil'),
    ).rejects.toThrow(/Refused to download from disallowed host/i);
  });

  it('downloadDocument accepts allowed github/githubusercontent/s3 hosts and logs origin+pathname only', async () => {
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    const fakeJson = { hello: 'world' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(fakeJson)),
      status: 200,
      statusText: 'OK',
    });

    const url = 'https://downloads.github.com/reports/report.json?sig=secret';
    const result = await client.downloadDocument(url);
    expect(result).toEqual(fakeJson);
    expect(mockLogger.debug).toHaveBeenCalled();
    const logged = mockLogger.debug.mock.calls[0][0] as string;
    expect(logged).toContain(
      'https://downloads.github.com/reports/report.json',
    );
    expect(logged).not.toContain('sig=');
  });

  it('downloadDocument accepts raw.githubusercontent.com host', async () => {
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    const fakeJson = { ok: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(fakeJson)),
      status: 200,
      statusText: 'OK',
    });

    const url =
      'https://raw.githubusercontent.com/my/repo/main/report.json?sig=xyz';
    const result = await client.downloadDocument(url);
    expect(result).toEqual(fakeJson);
  });

  it('downloadDocument accepts s3.amazonaws.com style hosts', async () => {
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    const fakeJson = { ok: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(fakeJson)),
      status: 200,
      statusText: 'OK',
    });

    const url = 'https://my-bucket.s3.amazonaws.com/report.json?sig=abc';
    const result = await client.downloadDocument(url);
    expect(result).toEqual(fakeJson);
  });

  it('scopes the download host allowlist to the configured GitHub host', async () => {
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    const fakeJson = { ok: true };
    const download = (client: GithubClientV2, url: string) => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(fakeJson)),
        status: 200,
        statusText: 'OK',
      });
      return client.downloadDocument(url);
    };

    const gheClient = new GithubClientV2(
      {
        host: 'octocorp.ghe.com',
        enterprise: 'octocorp',
        apiBaseUrl: 'https://api.octocorp.ghe.com',
      },
      mockConfig,
      mockLogger,
    );

    await expect(
      download(gheClient, 'https://objects.octocorp.ghe.com/report.json?sig=a'),
    ).resolves.toEqual(fakeJson);
    await expect(
      download(
        gheClient,
        'https://mystorage.blob.core.windows.net/report.json?sig=b',
      ),
    ).resolves.toEqual(fakeJson);
    await expect(
      download(
        gheClient,
        'https://raw.githubusercontent.com/report.json?sig=c',
      ),
    ).resolves.toEqual(fakeJson);

    // A GHE.com tenant must not trust github.com or another tenant.
    await expect(
      download(gheClient, 'https://downloads.github.com/report.json?sig=d'),
    ).rejects.toThrow(/Refused to download from disallowed host/i);
    await expect(
      download(gheClient, 'https://objects.evilcorp.ghe.com/report.json'),
    ).rejects.toThrow(/Refused to download from disallowed host/i);

    // And a github.com deployment must not trust a GHE.com tenant.
    const dotComClient = await GithubClientV2.fromConfig(
      mockConfig,
      mockLogger,
    );
    await expect(
      download(dotComClient, 'https://objects.octocorp.ghe.com/report.json'),
    ).rejects.toThrow(/Refused to download from disallowed host/i);

    // Object storage is a documented fallback for both, so it stays allowed
    // regardless of which host is configured.
    await expect(
      download(dotComClient, 'https://mystorage.blob.core.windows.net/r.json'),
    ).resolves.toEqual(fakeJson);

    // The guard must reject before issuing the request, so only the four
    // allowed downloads ever reached fetch.
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it('normalises the configured host and rejects non-https download links', async () => {
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    const fakeJson = { ok: true };
    const download = (client: GithubClientV2, url: string) => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(fakeJson)),
        status: 200,
        statusText: 'OK',
      });
      return client.downloadDocument(url);
    };

    // Casing and a port on copilot.host must not break host matching, and the
    // host itself is allowed, not just its subdomains.
    const gheClient = new GithubClientV2(
      {
        host: 'Octocorp.GHE.com:8443',
        enterprise: 'octocorp',
        apiBaseUrl: 'https://api.octocorp.ghe.com',
      },
      mockConfig,
      mockLogger,
    );

    await expect(
      download(gheClient, 'https://octocorp.ghe.com/report.json?sig=a'),
    ).resolves.toEqual(fakeJson);

    // Plain HTTP is never followed, even on an otherwise allowed host.
    await expect(
      download(gheClient, 'http://objects.octocorp.ghe.com/report.json'),
    ).rejects.toThrow(/Refused to download over insecure protocol: http:/i);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('allows the GHE.com tenant of the API base url when copilot.host is the API host', async () => {
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    const fakeJson = { ok: true };
    const download = (client: GithubClientV2, url: string) => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(fakeJson)),
        status: 200,
        statusText: 'OK',
      });
      return client.downloadDocument(url);
    };

    const apiHostClient = new GithubClientV2(
      {
        host: 'api.octocorp.ghe.com',
        enterprise: 'octocorp',
        apiBaseUrl: 'https://api.octocorp.ghe.com',
      },
      mockConfig,
      mockLogger,
    );

    await expect(
      download(
        apiHostClient,
        'https://copilot-reports.octocorp.ghe.com/report.json?sig=a',
      ),
    ).resolves.toEqual(fakeJson);
    await expect(
      download(apiHostClient, 'https://octocorp.ghe.com/report.json?sig=b'),
    ).resolves.toEqual(fakeJson);

    await expect(
      download(
        apiHostClient,
        'https://copilot-reports.evilcorp.ghe.com/report.json',
      ),
    ).rejects.toThrow(/Refused to download from disallowed host/i);
    await expect(
      download(
        apiHostClient,
        'https://copilot-reports.octocorp.ghe.com.evil.example/report.json',
      ),
    ).rejects.toThrow(/Refused to download from disallowed host/i);

    // Only a GHE.com API host extends the allowlist to its parent domain.
    const otherApiHostClient = new GithubClientV2(
      {
        host: 'api.example.com',
        enterprise: 'example',
        apiBaseUrl: 'https://api.example.com',
      },
      mockConfig,
      mockLogger,
    );
    await expect(
      download(otherApiHostClient, 'https://reports.example.com/report.json'),
    ).rejects.toThrow(/Refused to download from disallowed host/i);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('re-applies the host allowlist to redirect targets', async () => {
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;

    // A signed link on an allowed host must not be able to bounce the download
    // to an internal address.
    mockFetch.mockResolvedValueOnce({
      status: 302,
      statusText: 'Found',
      ok: false,
      headers: { get: () => 'https://169.254.169.254/latest/meta-data/' },
      text: jest.fn().mockResolvedValue(''),
    });

    await expect(
      client.downloadDocument('https://downloads.github.com/report.json?sig=a'),
    ).rejects.toThrow(/Refused to download from disallowed host/i);

    // A redirect that stays within the allowlist is followed.
    mockFetch.mockResolvedValueOnce({
      status: 302,
      statusText: 'Found',
      ok: false,
      headers: { get: () => 'https://my-bucket.s3.amazonaws.com/report.json' },
      text: jest.fn().mockResolvedValue(''),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
    });

    await expect(
      client.downloadDocument('https://downloads.github.com/report.json?sig=b'),
    ).resolves.toEqual({ ok: true });

    // `redirect: 'manual'` is what makes the per-hop re-check reachable at all;
    // without it undici would follow redirects internally and bypass the guard.
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      'https://my-bucket.s3.amazonaws.com/report.json',
      { redirect: 'manual' },
    );
  });

  it('points the GitHub App installation lookup at the configured API base url', async () => {
    const { getCopilotConfig, getGithubCredentials } = jest.requireMock(
      '../utils/GithubUtils',
    );
    getCopilotConfig.mockReturnValueOnce({
      host: 'octocorp.ghe.com',
      enterprise: 'octocorp',
      apiBaseUrl: 'https://api.octocorp.ghe.com',
    });
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });
    mockRequest
      .mockResolvedValueOnce({ data: { id: 999 } })
      .mockResolvedValueOnce({ data: { download_links: [] } });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    await client.fetchEnterpriseReportLinks('2026-01-01');

    // Both the installation-lookup client and the report client must target the
    // tenant's API. The lookup one used to always hit api.github.com.
    const MockedOctokit = Octokit as unknown as jest.Mock;
    expect(MockedOctokit.mock.calls[0][0].baseUrl).toBe(
      'https://api.octocorp.ghe.com',
    );
    expect(MockedOctokit.mock.calls[1][0].baseUrl).toBe(
      'https://api.octocorp.ghe.com',
    );
  });

  it('resolves relative redirects and rejects malformed redirect chains', async () => {
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    const redirectTo = (location: string | null) => ({
      status: 302,
      statusText: 'Found',
      ok: false,
      headers: { get: () => location },
      text: jest.fn().mockResolvedValue(''),
    });

    // A relative Location resolves against the URL it came from.
    mockFetch.mockResolvedValueOnce(redirectTo('/reports/final.json'));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
    });

    await expect(
      client.downloadDocument(
        'https://my-bucket.s3.eu-north-1.amazonaws.com/a/b.json?sig=1',
      ),
    ).resolves.toEqual({ ok: true });
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://my-bucket.s3.eu-north-1.amazonaws.com/reports/final.json',
      { redirect: 'manual' },
    );

    // A redirect without a Location header is an error, not a silent retry.
    mockFetch.mockResolvedValueOnce(redirectTo(null));
    await expect(
      client.downloadDocument('https://downloads.github.com/r.json?sig=2'),
    ).rejects.toThrow(/without a location header/i);

    // A Location that will not parse must not surface the signed URL, which
    // Node attaches to the error it throws.
    mockFetch.mockResolvedValueOnce(redirectTo('http://%'));
    const error: any = await client
      .downloadDocument('https://downloads.github.com/r.json?sig=secret')
      .catch(e => e);
    expect(error.message).toBe('Malformed redirect location');
    // Node attaches the base URL to the error it throws; ours must not.
    expect(Object.keys(error)).not.toContain('base');
    expect(JSON.stringify(error)).not.toContain('sig=secret');

    // And an endless redirect chain is capped rather than spinning forever.
    mockFetch.mockResolvedValue(
      redirectTo('https://downloads.github.com/loop.json'),
    );
    await expect(
      client.downloadDocument('https://downloads.github.com/loop.json?sig=3'),
    ).rejects.toThrow(/exceeded 5 redirects/i);
  });

  it('downloadDocument throws on non-OK HTTP status', async () => {
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const mockFetch = (global as any).fetch as jest.MockedFunction<any>;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(
      client.downloadDocument(
        'https://downloads.github.com/reports/missing.json?sig=x',
      ),
    ).rejects.toThrow(/Failed to download document: HTTP 404 Not Found/);
  });

  it('fetchEnterpriseReportLinks calls correct enterprise path and sets API version header', async () => {
    // Arrange
    mockRequest.mockResolvedValueOnce({
      data: {
        download_links: [
          'https://my-bucket.s3.amazonaws.com/report.json?sig=1',
        ],
      },
    });
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);

    // Act
    const res = await client.fetchEnterpriseReportLinks('2026-01-01');

    // Assert
    expect(mockRequest).toHaveBeenCalledWith(
      `GET /enterprises/my-enterprise/copilot/metrics/reports/enterprise-1-day?day=2026-01-01`,
    );

    expect(mockOutgoingHeaders[0]).toEqual({
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2026-03-10',
    });

    expect(res.download_links[0]).toContain('s3.amazonaws.com');
  });

  it('fetchOrganizationReportLinks calls correct org path', async () => {
    mockRequest.mockResolvedValueOnce({
      data: {
        download_links: ['https://raw.githubusercontent.com/report.json?sig=1'],
      },
    });
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);

    const res = await client.fetchOrganizationReportLinks('2026-01-02');

    expect(mockRequest).toHaveBeenCalledWith(
      `GET /orgs/my-org/copilot/metrics/reports/organization-1-day?day=2026-01-02`,
    );
    expect(res.download_links[0]).toContain('raw.githubusercontent.com');
  });

  it('fetchEnterpriseUserReportLinks calls correct users path', async () => {
    mockRequest.mockResolvedValueOnce({
      data: {
        download_links: ['https://raw.githubusercontent.com/users.json?sig=1'],
      },
    });
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);

    const res = await client.fetchEnterpriseUserReportLinks('2026-01-03');

    expect(mockRequest).toHaveBeenCalledWith(
      `GET /enterprises/my-enterprise/copilot/metrics/reports/users-1-day?day=2026-01-03`,
    );
    expect(res.download_links[0]).toContain('raw.githubusercontent.com');
  });

  it('uses enterprise credentials for cost centers and organization credentials for org reports', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    const credentials = {
      enterprise: 'enterprise-pat',
      organization: 'organization-pat',
    };
    getGithubCredentials
      .mockResolvedValueOnce(credentials)
      .mockResolvedValueOnce(credentials);
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
          '/enterprises/my-enterprise/settings/billing/cost-centers' &&
        url.searchParams.get('state') === 'active'
      ) {
        return githubResponse({ costCenters: [] });
      }
      if (
        url.pathname === '/orgs/my-org/copilot/metrics/reports/users-1-day' &&
        url.searchParams.get('day') === '2026-01-03'
      ) {
        return githubResponse({ download_links: [] });
      }
      throw new Error(`Unexpected GitHub request: ${route}`);
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    await client.fetchCostCenterMemberships();
    await client.fetchOrganizationUserReportLinks('2026-01-03');

    const MockedOctokit = Octokit as unknown as jest.Mock;
    expect(MockedOctokit.mock.calls.map(([options]) => options.auth)).toEqual([
      'enterprise-pat',
      'organization-pat',
    ]);
    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        '/enterprises/my-enterprise/settings/billing/cost-centers',
      ),
    );
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      'GET /orgs/my-org/copilot/metrics/reports/users-1-day?day=2026-01-03',
    );
  });

  it('fetchEnterpriseUserTeamsLinks calls correct user-teams path', async () => {
    mockRequest.mockResolvedValueOnce({
      data: {
        download_links: [
          'https://raw.githubusercontent.com/user-teams.json?sig=1',
        ],
      },
    });
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);

    const res = await client.fetchEnterpriseUserTeamsLinks('2026-01-04');

    expect(mockRequest).toHaveBeenCalledWith(
      `GET /enterprises/my-enterprise/copilot/metrics/reports/user-teams-1-day?day=2026-01-04`,
    );
    expect(res.download_links[0]).toContain('raw.githubusercontent.com');
  });

  it('fetchOrganizationUserTeamsLinks calls the org user-teams path', async () => {
    mockRequest.mockResolvedValueOnce({ data: { download_links: [] } });
    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);

    await client.fetchOrganizationUserTeamsLinks('2026-01-04');

    expect(mockRequest).toHaveBeenCalledWith(
      'GET /orgs/my-org/copilot/metrics/reports/user-teams-1-day?day=2026-01-04',
    );
  });

  it('discovers an enterprise GitHub App installation with the App-JWT endpoint', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });
    mockRequest
      .mockResolvedValueOnce({ data: { id: 174085427 } })
      .mockResolvedValueOnce({ data: { download_links: [] } });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    await client.fetchEnterpriseReportLinks('2026-01-01');

    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      'GET /enterprises/my-enterprise/installation',
    );
    expect(mockGetOrgInstallation).not.toHaveBeenCalled();

    const MockedOctokit = Octokit as unknown as jest.Mock;
    const baseHeadersHook = mockHookBefore.mock.calls[0][1] as (options: {
      headers: Record<string, string>;
    }) => void;
    const appJwtHook = mockHookBefore.mock.calls[1][1] as (options: {
      headers: Record<string, string>;
    }) => void;
    const requestOptions = { headers: {} as Record<string, string> };
    baseHeadersHook(requestOptions);
    appJwtHook(requestOptions);
    expect(requestOptions.headers).toEqual({
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2026-03-10',
      authorization: 'Bearer fake-app-jwt',
    });
    expect(MockedOctokit.mock.calls[1][0].auth).toEqual({
      appId: 123,
      privateKey: 'private-key',
      installationId: 174085427,
    });
  });

  it('falls back to the existing org-installation endpoint when enterprise lookup returns 404', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });
    mockRequest
      .mockRejectedValueOnce(httpError(404))
      .mockResolvedValueOnce({ data: { download_links: [] } });
    mockGetOrgInstallation.mockResolvedValueOnce({ data: { id: 321 } });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    await client.fetchEnterpriseReportLinks('2026-01-01');

    expect(mockGetOrgInstallation).toHaveBeenCalledWith({
      org: 'my-enterprise',
    });
    const MockedOctokit = Octokit as unknown as jest.Mock;
    expect(MockedOctokit.mock.calls[1][0].auth.installationId).toBe(321);
  });

  it('lists complete cost-center resources and accepts admin org membership permission', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });
    const mockFetch = global.fetch as jest.MockedFunction<any>;
    mockFetch.mockImplementation(async (input: string) => {
      const url = new URL(input);
      const page = Number(url.searchParams.get('page') ?? '1');
      if (
        url.pathname ===
        '/enterprises/my-enterprise/teams/ent:backend-guild/memberships'
      ) {
        return page === 1
          ? rawFetchResponse(
              [{ id: 1, login: 'octocat-user-1' }],
              '<https://api.github.com/enterprises/my-enterprise/teams/ent:backend-guild/memberships?page=2>; rel="next"',
            )
          : rawFetchResponse([{ id: 2, login: 'octocat-user-2' }]);
      }
      throw new Error(`Unexpected fetch request: ${url.pathname}${url.search}`);
    });

    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      const { pathname } = url;
      const page = Number(url.searchParams.get('page') ?? '1');

      if (pathname === '/enterprises/my-enterprise/installation') {
        return githubResponse({ id: 174085427 });
      }
      if (
        pathname === '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [
            {
              id: 'cc-engineering',
              name: 'cc-engineering',
              resources: [],
            },
          ],
        });
      }
      if (
        pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-engineering'
      ) {
        return page === 1
          ? githubResponse({
              id: 'cc-engineering',
              name: 'cc-engineering',
              resources: [{ type: 'Team', name: 'ent:backend-guild' }],
              has_next_page: true,
            })
          : githubResponse({
              id: 'cc-engineering',
              name: 'cc-engineering',
              resources: [
                { type: 'Org', name: 'product-org' },
                { type: 'Repo', name: 'ignored-repo' },
              ],
              has_next_page: false,
            });
      }
      if (pathname === '/enterprises/my-enterprise/teams') {
        return page === 1
          ? githubResponse(
              [{ id: 1, slug: 'ent:another-team' }],
              '<https://api.github.com/enterprises/my-enterprise/teams?page=2>; rel="next"',
            )
          : githubResponse([
              {
                id: 20258074,
                slug: 'ent:backend-guild',
                created_at: '2020-01-01T00:00:00Z',
              },
            ]);
      }
      if (pathname === '/orgs/product-org/installation') {
        return githubResponse({
          id: 174085514,
          permissions: { members: 'admin' },
        });
      }
      if (pathname === '/orgs/product-org/members') {
        return page === 1
          ? githubResponse(
              [{ id: 3, login: 'octocat-user-3' }],
              '<https://api.github.com/orgs/product-org/members?page=2>; rel="next"',
            )
          : githubResponse([{ id: 4, login: 'octocat-user-4' }]);
      }

      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.costCenters).toEqual([
      { id: 'cc-engineering', name: 'cc-engineering' },
    ]);
    expect(result.members).toEqual(
      new Map([
        [1, { costCenterId: 'cc-engineering', login: 'octocat-user-1' }],
        [2, { costCenterId: 'cc-engineering', login: 'octocat-user-2' }],
        [3, { costCenterId: 'cc-engineering', login: 'octocat-user-3' }],
        [4, { costCenterId: 'cc-engineering', login: 'octocat-user-4' }],
      ]),
    );
    expect(result.complete).toBe(true);
    expect(result.warnings).toEqual([]);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Ignoring cost center resource type "Repo"'),
    );

    const urls = mockRequest.mock.calls.map(([route]) =>
      parseMockRequestUrl(route),
    );
    const teamFetchCalls = mockFetch.mock.calls as Array<
      [string, { headers: { authorization: string } }]
    >;
    const teamMembershipPages = teamFetchCalls.map(([input]) => new URL(input));
    const listUrl = urls.find(
      url =>
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers',
    );
    expect(listUrl?.searchParams.get('state')).toBe('active');

    const detailPages = urls
      .filter(url =>
        url.pathname.endsWith('/settings/billing/cost-centers/cc-engineering'),
      )
      .map(url => ({
        page: url.searchParams.get('page'),
        perPage: url.searchParams.get('per_page'),
      }));
    expect(detailPages).toEqual([
      { page: '1', perPage: '100' },
      { page: '2', perPage: '100' },
    ]);

    const teamListPages = urls.filter(
      url => url.pathname === '/enterprises/my-enterprise/teams',
    );
    expect(teamListPages.map(url => url.searchParams.get('page'))).toEqual([
      '1',
      '2',
    ]);
    expect(
      teamListPages.every(url => url.searchParams.get('per_page') === '100'),
    ).toBe(true);

    expect(
      teamMembershipPages.map(url => url.searchParams.get('page')),
    ).toEqual(['1', '2']);
    expect(
      teamMembershipPages.every(
        url => url.searchParams.get('per_page') === '100',
      ),
    ).toBe(true);
    expect(teamMembershipPages[0].pathname).toContain(
      '/teams/ent:backend-guild/memberships',
    );
    expect(teamMembershipPages[0].pathname).not.toContain('%3A');
    expect(
      teamFetchCalls.every(
        ([, options]) =>
          options.headers.authorization === 'Bearer fake-installation-token',
      ),
    ).toBe(true);
    const MockedOctokit = Octokit as unknown as jest.Mock;
    expect(MockedOctokit.mock.results[1].value.auth).toHaveBeenCalledWith({
      type: 'installation',
    });

    const orgMemberPages = urls.filter(
      url => url.pathname === '/orgs/product-org/members',
    );
    expect(orgMemberPages.map(url => url.searchParams.get('page'))).toEqual([
      '1',
      '2',
    ]);
    expect(
      orgMemberPages.every(url => url.searchParams.get('per_page') === '100'),
    ).toBe(true);

    expect(
      MockedOctokit.mock.calls.some(
        call => call[0].auth?.installationId === 174085514,
      ),
    ).toBe(true);
  });

  it('skips an organization without an App installation without blocking other cost centers', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });
    mockRequest.mockImplementation(async (route: string) => {
      const { pathname } = parseMockRequestUrl(route);
      if (pathname === '/enterprises/my-enterprise/installation') {
        return githubResponse({ id: 10 });
      }
      if (
        pathname === '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [
            { id: 'cc-missing', name: 'Demo center' },
            { id: 'cc-valid', name: 'Known center' },
          ],
        });
      }
      if (
        pathname ===
          '/enterprises/my-enterprise/settings/billing/cost-centers/cc-missing' ||
        pathname ===
          '/enterprises/my-enterprise/settings/billing/cost-centers/cc-valid'
      ) {
        const costCenterId = pathname.endsWith('cc-missing')
          ? 'cc-missing'
          : 'cc-valid';
        return githubResponse({
          id: costCenterId,
          name: costCenterId,
          resources: [
            {
              type: 'Org',
              name: costCenterId === 'cc-missing' ? 'demo-org' : 'known-org',
            },
          ],
          has_next_page: false,
        });
      }
      if (pathname === '/orgs/demo-org/installation') {
        throw httpError(404);
      }
      if (pathname === '/orgs/known-org/installation') {
        return githubResponse({
          id: 20,
          permissions: { members: 'read' },
        });
      }
      if (pathname === '/orgs/known-org/members') {
        return githubResponse([{ id: 7, login: 'octocat-user-5' }]);
      }

      throw new Error(
        `Unexpected GitHub request: ${pathname}${
          parseMockRequestUrl(route).search
        }`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.complete).toBe(true);
    expect(result.unassignedComplete).toBe(false);
    expect(result.members).toEqual(
      new Map([[7, { costCenterId: 'cc-valid', login: 'octocat-user-5' }]]),
    );
    expect(result.warnings).toEqual([expect.stringContaining('Demo center')]);
    expect(result.warnings[0]).toContain('demo-org');
    expect(result.warnings[0]).toContain(
      'will not be counted in the no-cost-center bucket',
    );
  });

  it('warns and skips unavailable or empty App-backed org rosters while continuing with other orgs', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });
    const orgsById: Record<string, string> = {
      'cc-missing': 'missing-org',
      'cc-error': 'error-org',
      'cc-empty': 'empty-org',
      'cc-valid': 'valid-org',
    };

    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (url.pathname === '/enterprises/my-enterprise/installation') {
        return githubResponse({ id: 10 });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: Object.entries(orgsById).map(([id, org]) => ({
            id,
            name: id,
            resources: [{ type: 'Org', name: org }],
          })),
        });
      }
      const centerId = url.pathname.split('/').pop() ?? '';
      if (centerId in orgsById) {
        return githubResponse({
          id: centerId,
          name: centerId,
          resources: [{ type: 'Org', name: orgsById[centerId] }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/orgs/missing-org/installation') {
        throw httpError(404);
      }
      if (url.pathname === '/orgs/error-org/installation') {
        return githubResponse({ id: 20, permissions: { members: 'read' } });
      }
      if (url.pathname === '/orgs/empty-org/installation') {
        return githubResponse({ id: 30, permissions: { members: 'read' } });
      }
      if (url.pathname === '/orgs/valid-org/installation') {
        return githubResponse({ id: 40, permissions: { members: 'read' } });
      }
      if (url.pathname === '/orgs/error-org/members') {
        throw httpError(500);
      }
      if (url.pathname === '/orgs/empty-org/members') {
        return githubResponse([]);
      }
      if (url.pathname === '/orgs/valid-org/members') {
        return githubResponse([{ id: 7, login: 'octocat-user-6' }]);
      }

      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.warnings).toHaveLength(3);
    expect(result.warnings.join(' ')).toContain('missing-org');
    expect(result.warnings.join(' ')).toContain('error-org');
    expect(result.warnings.join(' ')).toContain('empty-org');
    expect(result.members).toEqual(
      new Map([[7, { costCenterId: 'cc-valid', login: 'octocat-user-6' }]]),
    );
    expect(result.complete).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledTimes(3);
  });

  it('skips App org rosters without members permission even if the public roster is non-empty', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });

    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (url.pathname === '/enterprises/my-enterprise/installation') {
        return githubResponse({ id: 10 });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [
            {
              id: 'cc-public',
              name: 'cc-public',
              resources: [{ type: 'Org', name: 'public-only-org' }],
            },
          ],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-public'
      ) {
        return githubResponse({
          id: 'cc-public',
          name: 'cc-public',
          resources: [{ type: 'Org', name: 'public-only-org' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/orgs/public-only-org/installation') {
        return githubResponse({
          id: 20,
          permissions: { members: 'none' },
        });
      }
      if (url.pathname === '/orgs/public-only-org/members') {
        return githubResponse([{ id: 88, login: 'octocat-user-7' }]);
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.members).toEqual(new Map());
    expect(result.complete).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('public-only-org');
    expect(result.warnings[0]).toContain('members: read');
    expect(
      mockRequest.mock.calls.some(([route]) =>
        parseMockRequestUrl(route).pathname.endsWith(
          '/public-only-org/members',
        ),
      ),
    ).toBe(false);
  });

  it('marks an organization roster incomplete when a member entry cannot be resolved', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: 'enterprise-pat',
    });
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({ costCenters: [{ id: 'cc-org', name: 'Org' }] });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-org'
      ) {
        return githubResponse({
          id: 'cc-org',
          name: 'Org',
          resources: [{ type: 'Org', name: 'roster-org' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/orgs/roster-org/members') {
        return githubResponse(
          [{ id: 1, login: 'octocat-user-8' }, { id: 2 }],
          undefined,
          { 'x-oauth-scopes': 'read:org' },
        );
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.complete).toBe(false);
    expect(result.members).toEqual(new Map());
    expect(result.warnings.join(' ')).toContain('roster-org');
  });

  it('caches per-org App installation clients across membership snapshots', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: { appId: 123, privateKey: 'private-key' },
    });
    let orgInstallationLookups = 0;
    let orgRosterRequests = 0;

    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (url.pathname === '/enterprises/my-enterprise/installation') {
        return githubResponse({ id: 10 });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-org', name: 'cc-org', resources: [] }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-org'
      ) {
        return githubResponse({
          id: 'cc-org',
          name: 'cc-org',
          resources: [{ type: 'Org', name: 'cached-org' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/orgs/cached-org/installation') {
        orgInstallationLookups += 1;
        return githubResponse({ id: 20, permissions: { members: 'read' } });
      }
      if (url.pathname === '/orgs/cached-org/members') {
        orgRosterRequests += 1;
        return githubResponse([{ id: 1, login: 'octocat-user-9' }]);
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    await client.fetchCostCenterMemberships();
    await client.fetchCostCenterMemberships();

    expect(orgInstallationLookups).toBe(1);
    expect(orgRosterRequests).toBe(2);
  });

  it('uses the same PAT Octokit for cost-center org rosters', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: 'enterprise-pat',
    });
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-pat', name: 'cc-pat', resources: [] }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-pat'
      ) {
        return githubResponse({
          id: 'cc-pat',
          name: 'cc-pat',
          resources: [{ type: 'Org', name: 'pat-org' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/orgs/pat-org/members') {
        return githubResponse(
          [{ id: 11, login: 'octocat-user-10' }],
          undefined,
          {
            'x-oauth-scopes': 'read:org, read:enterprise',
          },
        );
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.members).toEqual(
      new Map([[11, { costCenterId: 'cc-pat', login: 'octocat-user-10' }]]),
    );
    expect(mockCreateAppAuth).not.toHaveBeenCalled();
    const requestUrls = mockRequest.mock.calls.map(([route]) =>
      parseMockRequestUrl(route),
    );
    expect(
      requestUrls.some(url => url.pathname === '/orgs/pat-org/installation'),
    ).toBe(false);
    const MockedOctokit = Octokit as unknown as jest.Mock;
    expect(MockedOctokit).toHaveBeenCalledTimes(1);
    expect(MockedOctokit.mock.calls[0][0].auth).toBe('enterprise-pat');
  });

  it('skips non-empty PAT org rosters when the classic token lacks an org scope', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: 'enterprise-pat',
    });
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-public', name: 'cc-public', resources: [] }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-public'
      ) {
        return githubResponse({
          id: 'cc-public',
          name: 'cc-public',
          resources: [{ type: 'Org', name: 'public-only-org' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/orgs/public-only-org/members') {
        return githubResponse(
          [{ id: 88, login: 'octocat-user-7' }],
          undefined,
          {
            'x-oauth-scopes': 'repo, read:enterprise',
          },
        );
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.members).toEqual(new Map());
    expect(result.complete).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('public-only-org');
    expect(result.warnings[0]).toContain('read:org');
    expect(result.warnings[0]).not.toContain('completeness cannot be verified');
  });

  it('uses fine-grained PAT rosters and warns once when scope headers are absent', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: 'enterprise-pat',
    });
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-fine-grained', name: 'cc-fine-grained' }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-fine-grained'
      ) {
        return githubResponse({
          id: 'cc-fine-grained',
          name: 'cc-fine-grained',
          resources: [
            { type: 'Org', name: 'first-org' },
            { type: 'Org', name: 'second-org' },
          ],
          has_next_page: false,
        });
      }
      if (url.pathname === '/orgs/first-org/members') {
        return githubResponse([{ id: 101, login: 'octocat-user-11' }]);
      }
      if (url.pathname === '/orgs/second-org/members') {
        return githubResponse([{ id: 202, login: 'octocat-user-12' }]);
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.members).toEqual(
      new Map([
        [101, { costCenterId: 'cc-fine-grained', login: 'octocat-user-11' }],
        [202, { costCenterId: 'cc-fine-grained', login: 'octocat-user-12' }],
      ]),
    );
    expect(result.complete).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('completeness cannot be verified');
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
  });

  it('uses the enterprise PAT on raw-colon team membership requests', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: 'enterprise-pat',
    });
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-team', name: 'cc-team', resources: [] }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-team'
      ) {
        return githubResponse({
          id: 'cc-team',
          name: 'cc-team',
          resources: [{ type: 'Team', name: 'ent:backend-guild' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/enterprises/my-enterprise/teams') {
        return githubResponse([
          {
            id: 20258074,
            slug: 'ent:backend-guild',
            created_at: '2020-01-01T00:00:00Z',
          },
        ]);
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });
    const mockFetch = global.fetch as jest.MockedFunction<any>;
    mockFetch.mockImplementation(async () =>
      rawFetchResponse([{ id: 1, login: 'octocat-user-10' }]),
    );

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.members).toEqual(
      new Map([[1, { costCenterId: 'cc-team', login: 'octocat-user-10' }]]),
    );
    expect(result.complete).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/teams/ent:backend-guild/memberships?per_page=100&page=1',
      ),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer enterprise-pat',
        }),
      }),
    );
    const MockedOctokit = Octokit as unknown as jest.Mock;
    expect(MockedOctokit.mock.results[0].value.auth).toHaveBeenCalledWith();
    expect(mockCreateAppAuth).not.toHaveBeenCalled();
  });

  it('marks a cost-center snapshot incomplete when enterprise teams cannot be listed', async () => {
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-team', name: 'Team' }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-team'
      ) {
        return githubResponse({
          id: 'cc-team',
          name: 'Team',
          resources: [{ type: 'Team', name: 'platform' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/enterprises/my-enterprise/teams') {
        throw httpError(503);
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.complete).toBe(false);
    expect(result.members).toEqual(new Map());
    expect(result.warnings.join(' ')).toContain(
      'Could not list enterprise teams',
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('marks a cost-center snapshot incomplete when team membership lookup fails', async () => {
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-team', name: 'Team' }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-team'
      ) {
        return githubResponse({
          id: 'cc-team',
          name: 'Team',
          resources: [{ type: 'Team', name: 'platform' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/enterprises/my-enterprise/teams') {
        return githubResponse([{ id: 42, slug: 'platform' }]);
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });
    const mockFetch = global.fetch as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => null },
      json: jest.fn(),
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.complete).toBe(false);
    expect(result.members).toEqual(new Map());
    expect(result.warnings.join(' ')).toContain('Could not load members');
  });

  it('resolves direct User resources with the users endpoint when no expanded roster contains them', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      enterprise: 'enterprise-pat',
    });
    mockRequest.mockImplementation(async (route: string) => {
      const url = parseMockRequestUrl(route);
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers'
      ) {
        return githubResponse({
          costCenters: [{ id: 'cc-direct', name: 'cc-direct', resources: [] }],
        });
      }
      if (
        url.pathname ===
        '/enterprises/my-enterprise/settings/billing/cost-centers/cc-direct'
      ) {
        return githubResponse({
          id: 'cc-direct',
          name: 'cc-direct',
          resources: [{ type: 'User', name: 'octocat-user' }],
          has_next_page: false,
        });
      }
      if (url.pathname === '/users/octocat-user') {
        return githubResponse({ id: 12345, login: 'octocat-user' });
      }
      throw new Error(
        `Unexpected GitHub request: ${url.pathname}${url.search}`,
      );
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    const result = await client.fetchCostCenterMemberships();

    expect(result.members).toEqual(
      new Map([[12345, { costCenterId: 'cc-direct', login: 'octocat-user' }]]),
    );
    expect(result.complete).toBe(true);
    expect(
      mockRequest.mock.calls.some(([route]) =>
        parseMockRequestUrl(route).pathname.endsWith('/users/octocat-user'),
      ),
    ).toBe(true);
  });

  it.each([
    { status: 404, complete: true },
    { status: 403, complete: false },
    { status: 500, complete: false },
  ])(
    'treats a direct User lookup failure with HTTP $status as complete=$complete',
    async ({ status, complete }) => {
      const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
      getGithubCredentials.mockResolvedValueOnce({
        enterprise: 'enterprise-pat',
      });
      mockRequest.mockImplementation(async (route: string) => {
        const url = parseMockRequestUrl(route);
        if (
          url.pathname ===
          '/enterprises/my-enterprise/settings/billing/cost-centers'
        ) {
          return githubResponse({
            costCenters: [{ id: 'cc-direct', name: 'Direct users' }],
          });
        }
        if (
          url.pathname ===
          '/enterprises/my-enterprise/settings/billing/cost-centers/cc-direct'
        ) {
          return githubResponse({
            id: 'cc-direct',
            name: 'Direct users',
            resources: [{ type: 'User', name: 'octocat-user-14' }],
            has_next_page: false,
          });
        }
        if (url.pathname === '/users/octocat-user-14') {
          throw httpError(status);
        }
        throw new Error(
          `Unexpected GitHub request: ${url.pathname}${url.search}`,
        );
      });

      const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
      const result = await client.fetchCostCenterMemberships();

      expect(result.complete).toBe(complete);
      expect(result.members).toEqual(new Map());
      expect(result.warnings.join(' ')).toContain('octocat-user-14');
    },
  );

  it('keeps using the org-installation lookup for organization-scoped App clients', async () => {
    const { getGithubCredentials } = jest.requireMock('../utils/GithubUtils');
    getGithubCredentials.mockResolvedValueOnce({
      organization: { appId: 123, privateKey: 'private-key' },
    });
    mockRequest.mockResolvedValueOnce({
      data: { download_links: [] },
    });

    const client = await GithubClientV2.fromConfig(mockConfig, mockLogger);
    await client.fetchOrganizationReportLinks('2026-01-02');

    expect(mockGetOrgInstallation).toHaveBeenCalledWith({ org: 'my-org' });
    const MockedOctokit = Octokit as unknown as jest.Mock;
    expect(MockedOctokit.mock.calls[0][0].authStrategy).toBeDefined();
    expect(MockedOctokit.mock.calls[0][0].auth).toEqual({
      appId: 123,
      privateKey: 'private-key',
    });
    expect(mockRequest).toHaveBeenCalledWith(
      'GET /orgs/my-org/copilot/metrics/reports/organization-1-day?day=2026-01-02',
    );
    expect(mockCreateAppAuth).not.toHaveBeenCalled();
  });
});

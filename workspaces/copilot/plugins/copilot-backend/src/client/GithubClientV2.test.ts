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

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: mockRequest,
    rest: {
      apps: {
        getOrgInstallation: jest.fn().mockResolvedValue({ data: { id: 999 } }),
      },
    },
    graphql: jest.fn(),
  })),
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

describe('GithubClientV2', () => {
  let mockConfig: any;
  let mockLogger: any;
  let originalFetch: any;

  beforeEach(() => {
    jest.clearAllMocks();
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
    mockRequest.mockResolvedValueOnce({ data: { download_links: [] } });

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

    // Check Octokit construction included the API version header
    const MockedOctokit = Octokit as unknown as jest.Mock;
    const firstCallArgs = MockedOctokit.mock.calls[0][0] as any;
    expect(firstCallArgs.headers['X-GitHub-Api-Version']).toBe('2026-03-10');
    expect(firstCallArgs.baseUrl).toBe('https://api.github.com');

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
});

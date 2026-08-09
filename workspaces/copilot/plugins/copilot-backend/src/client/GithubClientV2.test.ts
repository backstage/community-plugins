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
      client.downloadDocument('http://internal.example.com/evil'),
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

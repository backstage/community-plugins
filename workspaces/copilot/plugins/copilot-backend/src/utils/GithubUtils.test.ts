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

import { getCopilotConfig, getGithubCredentials } from './GithubUtils';
import { mockServices } from '@backstage/backend-test-utils';

describe('getCopilotConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if host is missing', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        copilot: {},
      },
    });

    expect(() => getCopilotConfig(mockConfig)).toThrow(
      "Missing required config value at 'copilot.host'",
    );
  });

  it('should throw an error if GitHub configuration is missing', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        copilot: {
          host: 'myhost.com',
        },
      },
    });

    expect(() => getCopilotConfig(mockConfig)).toThrow(
      'GitHub configuration for host "myhost.com" is missing or incomplete.',
    );
  });

  it('should throw an error if enterprise is set but token is missing', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [{ host: 'github.com' }],
        },
        copilot: {
          host: 'github.com',
          enterprise: 'test',
        },
      },
    });

    expect(() => getCopilotConfig(mockConfig)).toThrow(
      'Enterprise API for copilot only works with "classic PAT" tokens. No token is configured for "github.com" in the config.',
    );
  });

  it('should throw an error if organization is set but token or app is missing', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [{ host: 'github.com' }],
        },
        copilot: {
          host: 'github.com',
          organization: 'test',
        },
      },
    });

    expect(() => getCopilotConfig(mockConfig)).toThrow(
      'Organization API for copilot works with both classic and fine grained PAT tokens or GitHub apps. No token or app is configured for "github.com" in the config.',
    );
  });
});

describe('getGithubCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if GitHub configuration is missing', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {},
    });

    await expect(
      getGithubCredentials(mockConfig, {
        host: 'myhost.com',
        apiBaseUrl: '',
      }),
    ).rejects.toThrow(
      'GitHub configuration for host "myhost.com" is missing or incomplete.',
    );
  });

  it('should throw an error if enterprise is set but token is missing', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [{ host: 'github.com' }],
        },
      },
    });

    await expect(
      getGithubCredentials(mockConfig, {
        host: 'github.com',
        enterprise: 'test',
        apiBaseUrl: '',
      }),
    ).rejects.toThrow(
      'Enterprise API for copilot only works with "classic PAT" tokens. No token is configured for "github.com" in the config.',
    );
  });

  it('should throw an error if organization is set but token or app is missing', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [{ host: 'github.com' }],
        },
      },
    });

    await expect(
      getGithubCredentials(mockConfig, {
        host: 'github.com',
        organization: 'test',
        apiBaseUrl: '',
      }),
    ).rejects.toThrow(
      'Organization API for copilot works with both classic and fine grained PAT tokens or GitHub apps. No token or app is configured for "github.com" in the config.',
    );
  });

  it('should return organisation credentials with token config', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [{ host: 'github.com', token: 'test-token' }],
        },
      },
    });

    const result = await getGithubCredentials(mockConfig, {
      host: 'github.com',
      organization: 'test',
      apiBaseUrl: '',
    });

    expect(result).toEqual({
      enterprise: undefined,
      organization: 'test-token',
    });
  });

  it('should return enterprise credentials with token config', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [{ host: 'github.com', token: 'test-token' }],
        },
      },
    });

    const result = await getGithubCredentials(mockConfig, {
      host: 'github.com',
      enterprise: 'test',
      apiBaseUrl: '',
    });

    expect(result).toEqual({
      enterprise: 'test-token',
      organization: undefined,
    });
  });

  it('should return both organization and enterprise credentials with token config', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [{ host: 'github.com', token: 'test-token' }],
        },
      },
    });

    const result = await getGithubCredentials(mockConfig, {
      host: 'github.com',
      organization: 'my-org',
      enterprise: 'my-ent',
      apiBaseUrl: '',
    });

    expect(result).toEqual({
      enterprise: 'test-token',
      organization: 'test-token',
    });
  });

  it('should return organization credentials with app config', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [
            {
              host: 'github.com',
              apps: [
                {
                  appId: 1234,
                  clientId: 'test',
                  clientSecret: 'test',
                  privateKey: `test`,
                  webhookSecret: 'shhh',
                  allowedInstallationOwners: ['test'],
                },
              ],
            },
          ],
        },
      },
    });

    const result = await getGithubCredentials(mockConfig, {
      host: 'github.com',
      organization: 'test',
      apiBaseUrl: '',
    });

    expect(result.enterprise).toBeUndefined();
    // organization should be an auth strategy config object
    expect(typeof result.organization).toBe('object');
    expect(result.organization).toHaveProperty('appId', 1234);
    expect(result.organization).toHaveProperty('privateKey');
  });

  it('should return organization credentials with app config and enterprise credentials with token config', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [
            {
              host: 'github.com',
              token: 'enterprise-token',
              apps: [
                {
                  appId: 1234,
                  clientId: 'test',
                  clientSecret: 'test',
                  privateKey: `test`,
                  webhookSecret: 'shhh',
                  allowedInstallationOwners: ['test'],
                },
              ],
            },
          ],
        },
        copilot: {
          host: 'github.com',
          organization: 'test',
          enterprise: 'my-enterprise',
        },
      },
    });

    const result = await getGithubCredentials(mockConfig, {
      host: 'github.com',
      organization: 'test',
      enterprise: 'my-enterprise',
      apiBaseUrl: '',
    });

    expect(result.enterprise).toBe('enterprise-token');
    // organization should be an auth strategy config object
    expect(typeof result.organization).toBe('object');
    expect(result.organization).toHaveProperty('appId', 1234);
    expect(result.organization).toHaveProperty('privateKey');
  });

  it('should select the correct app based on allowedInstallationOwners', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [
            {
              host: 'github.com',
              apps: [
                {
                  appId: 1111,
                  clientId: 'test1',
                  clientSecret: 'test1',
                  privateKey: `test1`,
                  webhookSecret: 'shhh1',
                  allowedInstallationOwners: ['other-org'],
                },
                {
                  appId: 2222,
                  clientId: 'test2',
                  clientSecret: 'test2',
                  privateKey: `test2`,
                  webhookSecret: 'shhh2',
                  allowedInstallationOwners: ['my-org', 'another-org'],
                },
              ],
            },
          ],
        },
      },
    });

    const result = await getGithubCredentials(mockConfig, {
      host: 'github.com',
      organization: 'my-org',
      apiBaseUrl: '',
    });

    expect(result.enterprise).toBeUndefined();
    expect(typeof result.organization).toBe('object');
    expect(result.organization).toHaveProperty('appId', 2222);
    expect(result.organization).toHaveProperty('privateKey');
  });

  it('should throw error if no app matches allowedInstallationOwners', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [
            {
              host: 'github.com',
              apps: [
                {
                  appId: 1111,
                  clientId: 'test1',
                  clientSecret: 'test1',
                  privateKey: `test1`,
                  webhookSecret: 'shhh1',
                  allowedInstallationOwners: ['other-org'],
                },
              ],
            },
          ],
        },
      },
    });

    await expect(
      getGithubCredentials(mockConfig, {
        host: 'github.com',
        organization: 'unauthorized-org',
        apiBaseUrl: '',
      }),
    ).rejects.toThrow(
      'No GitHub App configured for organization "unauthorized-org". Check allowedInstallationOwners in your GitHub integration config.',
    );
  });

  it('should require allowedInstallationOwners to be configured for organization', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [
            {
              host: 'github.com',
              apps: [
                {
                  appId: 1111,
                  clientId: 'test1',
                  clientSecret: 'test1',
                  privateKey: `test1`,
                  webhookSecret: 'shhh1',
                  // No allowedInstallationOwners - should not be selected
                },
              ],
            },
          ],
        },
      },
    });

    await expect(
      getGithubCredentials(mockConfig, {
        host: 'github.com',
        organization: 'any-org',
        apiBaseUrl: '',
      }),
    ).rejects.toThrow(
      'No GitHub App configured for organization "any-org". Check allowedInstallationOwners in your GitHub integration config.',
    );
  });

  it('should match organization case-insensitively', async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        integrations: {
          github: [
            {
              host: 'github.com',
              apps: [
                {
                  appId: 1111,
                  clientId: 'test1',
                  clientSecret: 'test1',
                  privateKey: `test1`,
                  webhookSecret: 'shhh1',
                  allowedInstallationOwners: ['My-Organization'],
                },
              ],
            },
          ],
        },
      },
    });

    const result = await getGithubCredentials(mockConfig, {
      host: 'github.com',
      organization: 'my-organization', // Different case
      apiBaseUrl: '',
    });

    expect(result.enterprise).toBeUndefined();
    expect(typeof result.organization).toBe('object');
    expect(result.organization).toHaveProperty('appId', 1111);
    expect(result.organization).toHaveProperty('privateKey');
  });
});

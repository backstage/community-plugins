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
import { DefaultGithubCredentialsProvider } from '@backstage/integration';

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

describe('getGithubInfo', () => {
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
      organization: {
        type: 'token',
        headers: { Authorization: 'Bearer test-token' },
        token: 'test-token',
      },
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
      enterprise: {
        type: 'token',
        headers: { Authorization: 'Bearer test-token' },
        token: 'test-token',
      },
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
      enterprise: {
        type: 'token',
        headers: { Authorization: 'Bearer test-token' },
        token: 'test-token',
      },
      organization: {
        type: 'token',
        headers: { Authorization: 'Bearer test-token' },
        token: 'test-token',
      },
    });
  });

  it('should return organization credentials with app config', async () => {
    jest
      .spyOn(DefaultGithubCredentialsProvider.prototype, 'getCredentials')
      .mockResolvedValue({
        type: 'app',
        headers: { Authorization: 'Bearer app-token' },
        token: 'app-token',
      });
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

    expect(result).toEqual({
      enterprise: undefined,
      organization: {
        type: 'app',
        headers: { Authorization: 'Bearer app-token' },
        token: 'app-token',
      },
    });
  });

  it('should return organization credentials with app config and enterprise credentials with token config', async () => {
    jest
      .spyOn(DefaultGithubCredentialsProvider.prototype, 'getCredentials')
      .mockResolvedValue({
        type: 'app',
        headers: { Authorization: 'Bearer app-token' },
        token: 'app-token',
      });
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

    expect(result).toEqual({
      enterprise: {
        type: 'token',
        headers: { Authorization: 'Bearer enterprise-token' },
        token: 'enterprise-token',
      },
      organization: {
        type: 'app',
        headers: { Authorization: 'Bearer app-token' },
        token: 'app-token',
      },
    });
  });
});

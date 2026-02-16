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

import { ServiceNowConnection } from './connection';
import { ServiceNowConfig } from '../../config';
import { mockServices } from '@backstage/backend-test-utils';
import { ClientCredentials, ResourceOwnerPassword } from 'simple-oauth2';
import axios from 'axios';

jest.mock('simple-oauth2');
jest.mock('axios');

describe('ServiceNowConnection', () => {
  let mockLogger: ReturnType<typeof mockServices.logger.mock>;
  let mockAxiosInstance: jest.Mocked<ReturnType<typeof axios.create>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = mockServices.logger.mock();
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
    } as any;

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  describe('constructor', () => {
    it('should throw error when instanceUrl is missing', () => {
      const config = {
        servicenow: {
          basicAuth: {
            username: 'user',
            password: 'pass',
          },
        },
      } as any;

      expect(() => {
        void new ServiceNowConnection(config, mockLogger);
      }).toThrow('ServiceNow instance url is missing. Please configure it.');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ServiceNow instance url is missing. Please configure it.',
      );
    });

    it('should throw error when neither oauth nor basicAuth is configured', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
        },
      };

      expect(() => {
        void new ServiceNowConnection(config, mockLogger);
      }).toThrow(
        'ServiceNow authentication configuration is missing. Please configure either OAuth or Basic Auth.',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ServiceNow authentication configuration is missing. Please configure either OAuth or Basic Auth.',
      );
    });

    it('should remove trailing slash from instanceUrl', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com/',
          basicAuth: {
            username: 'user',
            password: 'pass',
          },
        },
      };

      const conn = new ServiceNowConnection(config, mockLogger);
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://instance.service-now.com',
        }),
      );
      expect(conn).toBeDefined();
    });

    it('should log warning when basicAuth is configured', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          basicAuth: {
            username: 'user',
            password: 'pass',
          },
        },
      };

      void new ServiceNowConnection(config, mockLogger);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Basic authentication is configured for ServiceNow. This is not recommended for production environments.',
      );
    });

    it('should setup OAuth client when oauth is configured', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      const mockOAuthClient = {
        getToken: jest.fn(),
      };
      (ClientCredentials as jest.Mock).mockImplementation(
        () => mockOAuthClient,
      );

      void new ServiceNowConnection(config, mockLogger);

      expect(ClientCredentials).toHaveBeenCalledWith(
        expect.objectContaining({
          client: {
            id: 'client-id',
            secret: 'client-secret',
          },
          auth: {
            tokenHost: 'https://instance.service-now.com',
            tokenPath: '/oauth_token.do',
          },
        }),
      );
    });

    it('should throw error when OAuth password grant type is missing username or password', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'password',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          } as any,
        },
      };

      expect(() => {
        void new ServiceNowConnection(config, mockLogger);
      }).toThrow("Username and/or password missing for 'password' grant type.");
    });

    it('should throw error for unsupported OAuth grant type', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'unsupported' as any,
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      expect(() => {
        void new ServiceNowConnection(config, mockLogger);
      }).toThrow('Unsupported OAuth grantType: unsupported');
    });

    it('should create axios instance with correct configuration', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          basicAuth: {
            username: 'user',
            password: 'pass',
          },
        },
      };

      void new ServiceNowConnection(config, mockLogger);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://instance.service-now.com',
          timeout: 10000,
        }),
      );
    });
  });

  describe('getAxiosInstance', () => {
    it('should return the axios instance', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          basicAuth: {
            username: 'user',
            password: 'pass',
          },
        },
      };

      const connection = new ServiceNowConnection(config, mockLogger);
      const instance = connection.getAxiosInstance();

      expect(instance).toBe(mockAxiosInstance);
    });
  });

  describe('getAuthHeaders', () => {
    it('should return Basic Auth headers when basicAuth is configured', async () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          basicAuth: {
            username: 'testuser',
            password: 'testpass',
          },
        },
      };

      const connection = new ServiceNowConnection(config, mockLogger);
      const headers = await connection.getAuthHeaders();

      const expectedAuth = Buffer.from('testuser:testpass').toString('base64');
      expect(headers).toEqual({
        Authorization: `Basic ${expectedAuth}`,
      });
    });

    it('should return Bearer token for OAuth client_credentials grant type', async () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          token: {
            access_token: 'test-access-token',
          },
        }),
      };
      (ClientCredentials as jest.Mock).mockImplementation(
        () => mockOAuthClient,
      );

      const connection = new ServiceNowConnection(config, mockLogger);
      const headers = await connection.getAuthHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer test-access-token',
      });
      expect(mockOAuthClient.getToken).toHaveBeenCalledWith({});
    });

    it('should return Bearer token for OAuth password grant type', async () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'password',
            clientId: 'client-id',
            clientSecret: 'client-secret',
            username: 'testuser',
            password: 'testpass',
          },
        },
      };

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          token: {
            access_token: 'test-access-token',
          },
        }),
      };
      (ResourceOwnerPassword as jest.Mock).mockImplementation(
        () => mockOAuthClient,
      );

      const connection = new ServiceNowConnection(config, mockLogger);
      const headers = await connection.getAuthHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer test-access-token',
      });
      expect(mockOAuthClient.getToken).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      });
    });

    it('should throw error when access_token is missing in token response', async () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          token: {},
        }),
      };
      (ClientCredentials as jest.Mock).mockImplementation(
        () => mockOAuthClient,
      );

      const connection = new ServiceNowConnection(config, mockLogger);

      await expect(connection.getAuthHeaders()).rejects.toThrow(
        'Failed to obtain access token: Failed to obtain access_token string (token data is invalid or missing).',
      );
    });

    it('should throw error when token response is invalid', async () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          token: null,
        }),
      };
      (ClientCredentials as jest.Mock).mockImplementation(
        () => mockOAuthClient,
      );

      const connection = new ServiceNowConnection(config, mockLogger);

      await expect(connection.getAuthHeaders()).rejects.toThrow(
        'Failed to obtain access token: Failed to obtain access_token string (token data is invalid or missing).',
      );
    });

    it('should handle OAuth token acquisition errors', async () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      const mockOAuthClient = {
        getToken: jest
          .fn()
          .mockRejectedValue(new Error('Token acquisition failed')),
      };
      (ClientCredentials as jest.Mock).mockImplementation(
        () => mockOAuthClient,
      );

      const connection = new ServiceNowConnection(config, mockLogger);

      await expect(connection.getAuthHeaders()).rejects.toThrow(
        'Failed to obtain access token: Token acquisition failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching ServiceNow token: Token acquisition failed',
        expect.any(Object),
      );
    });

    it('should log detailed error when axios error occurs during token acquisition', async () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'https://instance.service-now.com',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      const axiosError = {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        stack: 'error stack',
      };

      const mockOAuthClient = {
        getToken: jest.fn().mockRejectedValue(axiosError),
      };
      (ClientCredentials as jest.Mock).mockImplementation(
        () => mockOAuthClient,
      );

      const connection = new ServiceNowConnection(config, mockLogger);

      await expect(connection.getAuthHeaders()).rejects.toThrow(
        'Failed to obtain access token: Request failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'OAuth2 token error details: Status 401, Data: {"error":"Unauthorized"}',
      );
    });
  });

  describe('setupOAuthClient', () => {
    it('should handle invalid tokenUrl', () => {
      const config: ServiceNowConfig = {
        servicenow: {
          instanceUrl: 'invalid-url',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        },
      };

      // Mock URL constructor to throw error
      const originalURL = global.URL;
      global.URL = jest.fn().mockImplementation(() => {
        throw new Error('Invalid URL');
      }) as any;

      expect(() => {
        void new ServiceNowConnection(config, mockLogger);
      }).toThrow('Invalid tokenUrl: invalid-url/oauth_token.do');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Invalid tokenUrl constructed or provided: invalid-url/oauth_token.do',
        ),
      );

      global.URL = originalURL;
    });
  });
});

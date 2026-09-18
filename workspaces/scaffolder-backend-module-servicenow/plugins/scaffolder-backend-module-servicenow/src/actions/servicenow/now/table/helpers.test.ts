/*
 * Copyright 2026 The Backstage Authors
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
import { ConfigReader } from '@backstage/config';

import { OpenAPI } from '../../../../generated/now/table';
import { serviceNowApiErrorMessage, updateOpenAPIConfig } from './helpers';

describe('updateOpenAPIConfig', () => {
  const originalBase = OpenAPI.BASE;
  const originalUsername = OpenAPI.USERNAME;
  const originalPassword = OpenAPI.PASSWORD;

  afterEach(() => {
    OpenAPI.BASE = originalBase;
    OpenAPI.USERNAME = originalUsername;
    OpenAPI.PASSWORD = originalPassword;
  });

  it('throws when servicenow config is absent', () => {
    expect(() => updateOpenAPIConfig(OpenAPI, new ConfigReader({}))).toThrow(
      /Missing required config value at 'servicenow.baseUrl'/,
    );
  });

  it('throws when required fields are incomplete', () => {
    expect(() =>
      updateOpenAPIConfig(
        OpenAPI,
        new ConfigReader({
          servicenow: {
            baseUrl: 'https://example.service-now.com',
          },
        }),
      ),
    ).toThrow(/Missing required config value at 'servicenow.username'/);
  });

  it('applies baseUrl, username, and password when config is complete', () => {
    updateOpenAPIConfig(
      OpenAPI,
      new ConfigReader({
        servicenow: {
          baseUrl: 'https://example.service-now.com',
          username: 'test-user',
          password: 'test-password',
        },
      }),
    );

    expect(OpenAPI.BASE).toBe('https://example.service-now.com');
    expect(OpenAPI.USERNAME).toBe('test-user');
    expect(OpenAPI.PASSWORD).toBe('test-password');
  });
});

describe('serviceNowApiErrorMessage', () => {
  it('prefers body.error.message when present', () => {
    expect(
      serviceNowApiErrorMessage({
        body: { error: { message: 'User Not Authenticated' } },
        statusText: 'Unauthorized',
        message: 'Generic Error',
      }),
    ).toBe('User Not Authenticated');
  });

  it('falls back to statusText when body.error.message is missing', () => {
    expect(
      serviceNowApiErrorMessage({
        body: { error: {} },
        statusText: 'Bad Request',
        message: 'Generic Error',
      }),
    ).toBe('Bad Request');
  });

  it('falls back to a default message when nothing useful is present', () => {
    expect(serviceNowApiErrorMessage({})).toBe('ServiceNow API request failed');
  });
});

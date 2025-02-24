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
import {
  getInstanceByName,
  toInstance,
  processFetch,
  formatOperationMessage,
  buildArgoUrl,
} from './serviceUtils';
import { AuthenticationError } from '@backstage/errors';
import { Instance } from '../types';
import { ConfigReader } from '@backstage/config';

describe('serviceUtils', () => {
  describe('getInstanceByName', () => {
    const instances = [
      { name: 'instance-a', url: 'https://instance-a.com' },
      { name: 'instance-b', url: 'https://instance-b.com' },
      { name: 'instance-c', url: 'https://instance-c.com' },
    ];

    it('should return matching instance', () => {
      const result: Instance | undefined = getInstanceByName({
        instances,
        instanceName: 'instance-a',
      });
      expect(result?.name).toEqual('instance-a');
    });

    it('should return undefined for non-existent instance', () => {
      const result: Instance | undefined = getInstanceByName({
        instances,
        instanceName: 'non-existent',
      });
      expect(result).toBeUndefined();
    });
  });

  describe('toInstance', () => {
    it('should convert config to instance', () => {
      const instanceConfig = new ConfigReader({
        name: 'test',
        url: 'https://test.com',
        token: 'test-token',
      });
      const result: Instance = toInstance(instanceConfig);
      expect(result).toEqual({
        name: 'test',
        url: 'https://test.com',
        token: 'test-token',
        username: undefined,
        password: undefined,
      } as Instance);
    });
  });

  describe('processFetch', () => {
    it('should throw AuthenticationError for 401', async () => {
      const response = new Response(null, { status: 401 });
      await expect(processFetch(response, 'http://test')).rejects.toThrow(
        AuthenticationError,
      );
    });
    it('should throw AuthenticationError for 403', async () => {
      const response = new Response(null, { status: 403 });
      await expect(processFetch(response, 'http://test')).rejects.toThrow(
        AuthenticationError,
      );
    });
  });

  describe('formatOperationMessage', () => {
    it('should format error message with options', () => {
      const result = formatOperationMessage('Failed', 'test-instance', {
        appName: 'test-app',
      });
      expect(result).toBe(
        "Failed from Instance 'test-instance' with appName 'test-app'",
      );
    });
  });

  describe('buildArgoUrl', () => {
    it('should build URL with params', () => {
      const url = buildArgoUrl(
        'https://test-instance.com',
        'applications/test-app',
        {
          selector: 'test=true',
          appNamespace: 'test',
          project: 'testing',
        },
      );
      expect(url).toEqual(
        'https://test-instance.com/api/v1/applications/test-app?selector=test%3Dtrue&appNamespace=test&project=testing',
      );
    });
  });
});

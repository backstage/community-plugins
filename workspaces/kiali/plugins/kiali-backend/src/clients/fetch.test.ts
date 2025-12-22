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
import { mockServices } from '@backstage/backend-test-utils';
import { AxiosError } from 'axios';
import { AuthStrategy } from './Auth';
import { KialiFetcher, ValidationCategory } from './fetch';
import fs from 'fs';

const logger = mockServices.logger.mock();

describe('kiali Fetch', () => {
  describe('Kiali configuration validation', () => {
    describe(`${AuthStrategy.anonymous} strategy`, () => {
      it('should validate anonymous strategy', async () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000/',
            urlExternal: 'https://localhost:4000/',
          },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.anonymous,
          sessionInfo: {},
        });

        expect(result.verify).toBeTruthy();
        expect(result.category).toBe(ValidationCategory.unknown);
      });
    });

    describe(`${AuthStrategy.token} strategy`, () => {
      it('should fail if serviceAccountToken is missing', async () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000/',
            urlExternal: 'https://localhost:4000/',
          },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.token,
          sessionInfo: {},
        });

        expect(result.verify).toBeFalsy();
        expect(result.category).toBe(ValidationCategory.configuration);
        expect(result.missingAttributes).toContain('serviceAccountToken');
      });

      it('should pass if serviceAccountToken is set', async () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000/',
            serviceAccountToken: 'token123',
            urlExternal: 'https://localhost:4000/',
          },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.token,
          sessionInfo: {},
        });

        expect(result.verify).toBeTruthy();
        expect(result.category).toBe(ValidationCategory.unknown);
      });
    });

    it('should fail for unsupported openid strategy', async () => {
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000/',
          urlExternal: 'https://localhost:4000/',
        },
        logger,
      );
      const result = (kialiFetch as any).validateConfiguration({
        strategy: AuthStrategy.openid,
        sessionInfo: {},
      });

      expect(result.verify).toBeFalsy();
      expect(result.category).toBe(ValidationCategory.configuration);
      expect(result.message).toContain('not supported');
    });
  });

  describe('Read CA files', () => {
    const fixturePath = `${process.cwd()}/plugins/kiali-backend/__fixtures__/ca_example.pem`;
    fs.mkdirSync(`${process.cwd()}/plugins/kiali-backend/__fixtures__`, {
      recursive: true,
    });
    fs.writeFileSync(fixturePath, 'dummy CA content');
    it('should return null if no file/data', () => {
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000/',
          urlExternal: 'https://localhost:4000/',
        },
        logger,
      );
      const result = (kialiFetch as any).bufferFromFileOrString();
      expect(result).toBeNull();
    });

    it('should read from file', () => {
      fs.writeFileSync(fixturePath, 'dummy CA content');
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000/',
          urlExternal: 'https://localhost:4000/',
        },
        logger,
      );
      const result = (kialiFetch as any).bufferFromFileOrString(fixturePath);
      expect(result).toBeInstanceOf(Buffer);
      fs.unlinkSync(fixturePath); // clean up
    });

    it('should read from data string', () => {
      const data = Buffer.from('dummy CA content').toString('base64');
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000/',
          urlExternal: 'https://localhost:4000/',
        },
        logger,
      );
      const result = (kialiFetch as any).bufferFromFileOrString(
        undefined,
        data,
      );
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('Handle unsuccessful response', () => {
    it('should format message with endpoint', () => {
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000/',
          urlExternal: 'https://localhost:4000/',
        },
        logger,
      );
      const axiosError = new AxiosError('error', '404');
      const result = (kialiFetch as any).handleUnsuccessfulResponse(
        axiosError,
        '/api/test',
      );
      expect(result).toContain('when fetching "/api/test"');
    });
  });

  describe('Basic Auth support', () => {
    it('should include Authorization header when basicAuth is set', () => {
      const basicAuth = 'dXNlcjpwYXNz'; // base64(user:pass)
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000/',
          urlExternal: 'https://localhost:4000/',
          basicAuth,
        },
        logger,
      );
      const requestInit = (kialiFetch as any).getRequestInit('/api/test');
      expect(requestInit.headers.Authorization).toBe(`Basic ${basicAuth}`);
    });
  });
});

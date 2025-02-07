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

const logger = mockServices.logger.mock();

describe('kiali Fetch', () => {
  describe('Kiali configuration validation', () => {
    describe(`${AuthStrategy.anonymous} strategy`, () => {
      it('should get a true', async () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000',
            urlExternal: 'https://localhost:4000',
          },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.anonymous,
          sessionInfo: {},
        });

        expect(result.verify).toBeTruthy();
        expect(result.category).toBe(ValidationCategory.unknown);
        expect(result.message).toBeUndefined();
        expect(result.missingAttributes).toBeUndefined();
        expect(result.helper).toBeUndefined();
      });
    });
    describe(`${AuthStrategy.token} strategy`, () => {
      it('should get a false when `serviceAccountToken` is missed', async () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000',
            urlExternal: 'https://localhost:4000',
          },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.token,
          sessionInfo: {},
        });

        expect(result.verify).toBeFalsy();
        expect(result.category).toBe(ValidationCategory.configuration);
        expect(result.message).toBeDefined();
        expect(result.message).toStrictEqual(
          "Attribute 'serviceAccountToken' is not in the backstage configuration",
        );
        expect(result.missingAttributes).toBeDefined();
        expect(result.missingAttributes[0]).toStrictEqual(
          'serviceAccountToken',
        );
      });

      it('should get a true when `serviceAccountToken` is set', async () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000',
            serviceAccountToken: '<token>',
            urlExternal: 'https://localhost:4000',
          },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.token,
          sessionInfo: {},
        });

        expect(result.verify).toBeTruthy();
        expect(result.category).toBe(ValidationCategory.unknown);
        expect(result.message).toBeUndefined();
        expect(result.missingAttributes).toBeUndefined();
        expect(result.helper).toBeUndefined();
      });
    });

    describe(`Not ${AuthStrategy.openid} strategy supported`, () => {
      it('should get a true', async () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000',
            urlExternal: 'https://localhost:4000',
          },
          logger,
        );
        const result = (kialiFetch as any).validateConfiguration({
          strategy: AuthStrategy.openid,
          sessionInfo: {},
        });

        expect(result.verify).toBeFalsy();
        expect(result.category).toBe(ValidationCategory.configuration);
        expect(result.message).toBeDefined();
        expect(result.message).toStrictEqual(
          `Strategy ${AuthStrategy.openid} is not supported in Kiali backstage plugin yet`,
        );
      });
    });
  });

  describe('Read Ca files', () => {
    describe('bufferFromFileOrString', () => {
      it('No file or data passed', () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000',
            urlExternal: 'https://localhost:4000',
          },
          logger,
        );
        const result = (kialiFetch as any).bufferFromFileOrString();

        expect(result).toBeNull();
      });

      it('Read from file', () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000',
            urlExternal: 'https://localhost:4000',
          },
          logger,
        );
        const result = (kialiFetch as any).bufferFromFileOrString(
          `${process.cwd()}/plugins/kiali-backend/__fixtures__/ca_example.pem`,
        );

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Buffer);
      });

      it('Read from data', () => {
        const kialiFetch = new KialiFetcher(
          {
            name: 'default',
            url: 'https://localhost:4000',
            urlExternal: 'https://localhost:4000',
          },
          logger,
        );
        const result = (kialiFetch as any).bufferFromFileOrString(
          undefined,
          `${process.cwd()}/plugins/kiali-backend/__fixtures__/ca_example.pem`,
        );

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Buffer);
      });
    });
  });

  describe('Return networking error in checkSession', () => {
    it('Respond with verify category to network', async () => {
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000',
          urlExternal: 'https://localhost:4000',
        },
        logger,
      );

      jest.mock('./fetch', () => ({
        getAuthInfo: Promise.reject({}),
      }));
      const validations = await kialiFetch.checkSession();
      expect(validations).toBeDefined();
      expect(validations.title).toBe('Error reaching Kiali');
      expect(validations.category).toBe(ValidationCategory.networking);
    });
  });

  describe('Handle Unsuccessful Response', () => {
    it('Respond with a readable message with endpoint', () => {
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000',
          urlExternal: 'https://localhost:4000',
        },
        logger,
      );
      const message = 'Error server message';
      const code = '404';
      const endpoint = '/api/status';
      const axiosError = new AxiosError(message, code);
      const result = (kialiFetch as any).handleUnsuccessfulResponse(
        axiosError,
        endpoint,
      );

      expect(result).toStrictEqual(
        `[${code}] Fetching when fetching "${endpoint}" in "Kiali"; body=[${message}]`,
      );
    });

    it('Respond with a readable message without endpoint', () => {
      const kialiFetch = new KialiFetcher(
        {
          name: 'default',
          url: 'https://localhost:4000',
          urlExternal: 'https://localhost:4000',
        },
        logger,
      );
      const message = 'Error server message';
      const code = '404';
      const axiosError = new AxiosError(message, code);
      const result = (kialiFetch as any).handleUnsuccessfulResponse(axiosError);

      expect(result).toStrictEqual(`[${code}] Fetching  body=[${message}]`);
    });
  });
});

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
import supported from '../kiali_supported.json';
import { KIALI_CORE_VERSION, KialiApiImpl } from './KialiAPIConnector';

const logger = mockServices.logger.mock();

const kialiApi = new KialiApiImpl({
  logger,
  kiali: {
    name: 'default',
    url: 'https://localhost:4000',
    urlExternal: 'https://localhost:4000',
  },
});

describe('kiali Api Connector', () => {
  describe('Validate suported version', () => {
    it('Plugin support the version', () => {
      const versionsToTest = ['v1.73', 'v1.73.6'];
      versionsToTest.forEach(version => {
        const support = kialiApi.supportedVersion(version);
        expect(support).toBeUndefined();
      });
    });

    it('Plugin not support version', () => {
      const versionToTest = 'v1.70';
      const support = kialiApi.supportedVersion(versionToTest);
      const kialiSupported = supported[KIALI_CORE_VERSION];
      expect(support).toBe(
        `Kiali version supported is ${kialiSupported}, we found version ${versionToTest}`,
      );
    });
  });
});

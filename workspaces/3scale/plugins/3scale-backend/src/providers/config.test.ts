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

import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';

import { readThreeScaleApiEntityConfigs } from './config';

describe('readThreeScaleApiEntityConfigs', () => {
  it('returns an empty array when the provider section is absent', () => {
    const config = mockServices.rootConfig({ data: {} });

    expect(readThreeScaleApiEntityConfigs(config)).toEqual([]);
  });

  it('returns provider configs with required fields', () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          threeScaleApiEntity: {
            dev: {
              baseUrl: 'https://example-admin.3scale.net',
              accessToken: 'test-token',
            },
          },
        },
      },
    });

    expect(readThreeScaleApiEntityConfigs(config)).toEqual([
      {
        id: 'dev',
        baseUrl: 'https://example-admin.3scale.net',
        accessToken: 'test-token',
        systemLabel: undefined,
        ownerLabel: undefined,
        addLabels: true,
        schedule: undefined,
      },
    ]);
  });

  it('parses optional fields and schedule configuration', () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          threeScaleApiEntity: {
            dev: {
              baseUrl: 'https://example-admin.3scale.net',
              accessToken: 'test-token',
              systemLabel: 'custom-system',
              ownerLabel: 'custom-owner',
              schedule: {
                frequency: 'PT1H',
                timeout: 'PT5M',
              },
            },
          },
        },
      },
    });

    expect(readThreeScaleApiEntityConfigs(config)).toEqual([
      {
        id: 'dev',
        baseUrl: 'https://example-admin.3scale.net',
        accessToken: 'test-token',
        systemLabel: 'custom-system',
        ownerLabel: 'custom-owner',
        addLabels: true,
        schedule: {
          frequency: { hours: 1 },
          timeout: { minutes: 5 },
          initialDelay: undefined,
          scope: undefined,
        },
      },
    ]);
  });

  it('parses addLabels: false when explicitly configured', () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          threeScaleApiEntity: {
            dev: {
              baseUrl: 'https://example-admin.3scale.net',
              accessToken: 'test-token',
              addLabels: false,
            },
          },
        },
      },
    });

    expect(readThreeScaleApiEntityConfigs(config)).toEqual([
      {
        id: 'dev',
        baseUrl: 'https://example-admin.3scale.net',
        accessToken: 'test-token',
        systemLabel: undefined,
        ownerLabel: undefined,
        addLabels: false,
        schedule: undefined,
      },
    ]);
  });
});

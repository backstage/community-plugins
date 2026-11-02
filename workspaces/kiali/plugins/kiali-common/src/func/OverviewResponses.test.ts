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
import {
  groupIstioConfigByNamespace,
  normalizeConfigValidations,
} from './OverviewResponses';

describe('normalizeConfigValidations', () => {
  it('normalizes array responses from newer APIs', () => {
    const result = normalizeConfigValidations([
      { cluster: 'east', namespace: 'bookinfo', errors: 1, warnings: 0 },
      { cluster: 'east', namespace: 'default', errors: 0, warnings: 2 },
      { cluster: 'west', namespace: 'bookinfo', errors: 0, warnings: 0 },
      { errors: 0, warnings: 0 },
    ]);

    expect(result.get('east')?.get('bookinfo')).toEqual({
      cluster: 'east',
      namespace: 'bookinfo',
      errors: 1,
      warnings: 0,
    });
    expect(result.get('east')?.get('default')?.warnings).toBe(2);
    expect(result.get('west')?.get('bookinfo')?.errors).toBe(0);
    expect(result.get('east')?.size).toBe(2);
  });

  it('normalizes nested map responses from older APIs', () => {
    const result = normalizeConfigValidations({
      east: {
        bookinfo: { errors: 1, warnings: 0 },
        default: { errors: 0, warnings: 2 },
      },
      west: {
        bookinfo: { errors: 0, warnings: 0 },
      },
    });

    expect(result.get('east')?.get('bookinfo')?.errors).toBe(1);
    expect(result.get('west')?.get('bookinfo')?.warnings).toBe(0);
  });

  it('returns an empty map for unexpected payloads', () => {
    expect(normalizeConfigValidations(undefined).size).toBe(0);
    expect(normalizeConfigValidations(null).size).toBe(0);
    expect(normalizeConfigValidations('bad').size).toBe(0);
  });
});

describe('groupIstioConfigByNamespace', () => {
  it('groups GVK-keyed resources by namespace', () => {
    const result = groupIstioConfigByNamespace({
      permissions: {},
      validations: {},
      resources: {
        'networking.istio.io/v1,Kind=VirtualService': [
          { metadata: { name: 'reviews', namespace: 'bookinfo' } },
          { metadata: { name: 'details', namespace: 'bookinfo' } },
          { metadata: { name: 'httpbin', namespace: 'default' } },
          { metadata: { name: 'orphan' } },
        ],
      },
    });

    expect(
      result.get('bookinfo')?.resources[
        'networking.istio.io/v1,Kind=VirtualService'
      ],
    ).toHaveLength(2);
    expect(
      result.get('default')?.resources[
        'networking.istio.io/v1,Kind=VirtualService'
      ],
    ).toHaveLength(1);
    expect(result.has('orphan')).toBe(false);
  });

  it('preserves legacy namespace-keyed responses', () => {
    const bookinfoConfig = {
      permissions: {},
      validations: {},
      resources: { VirtualService: [{ metadata: { name: 'reviews' } }] },
    };
    const result = groupIstioConfigByNamespace({
      bookinfo: bookinfoConfig,
      default: {
        permissions: {},
        validations: {},
        resources: {},
      },
    });

    expect(result.get('bookinfo')).toEqual(bookinfoConfig);
    expect(result.get('default')?.resources).toEqual({});
  });

  it('returns an empty map for unexpected payloads', () => {
    expect(groupIstioConfigByNamespace(undefined).size).toBe(0);
    expect(groupIstioConfigByNamespace(null).size).toBe(0);
    expect(groupIstioConfigByNamespace('bad').size).toBe(0);
  });
});

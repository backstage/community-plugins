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
  normalizeMgmtFlags,
  normalizeSdkFlags,
  detectType,
  mgmtTypeToFlagType,
  MgmtFeature,
} from './helpers';

const MGMT_FEATURES: MgmtFeature[] = [
  {
    id: 'boolean-flag',
    project: 'prj_abc',
    valueType: 'boolean',
    defaultValue: 'true',
    environments: {
      prod: { enabled: true, defaultValue: 'false' },
    },
  },
  {
    id: 'string-flag',
    project: 'prj_abc',
    valueType: 'string',
    defaultValue: 'default-value',
    environments: {
      prod: { enabled: true, defaultValue: 'prod-value' },
    },
  },
  {
    id: 'json-flag',
    project: 'prj_abc',
    valueType: 'json',
    defaultValue: '{"key":"default"}',
    environments: {
      prod: { enabled: true, defaultValue: '{"key":"prod"}' },
    },
  },
  {
    id: 'number-flag',
    project: 'prj_abc',
    valueType: 'number',
    defaultValue: '10',
    environments: {},
  },
];

describe('mgmtTypeToFlagType', () => {
  it.each([
    ['boolean', 'boolean'],
    ['number', 'number'],
    ['json', 'json'],
    ['string', 'string'],
    ['unknown', 'null'],
    ['', 'null'],
  ])('maps "%s" → "%s"', (input, expected) => {
    expect(mgmtTypeToFlagType(input)).toBe(expected);
  });
});

describe('detectType', () => {
  it('detects boolean', () => expect(detectType(true)).toBe('boolean'));
  it('detects number', () => expect(detectType(42)).toBe('number'));
  it('detects null', () => expect(detectType(null)).toBe('null'));
  it('detects undefined', () => expect(detectType(undefined)).toBe('null'));
  it('detects object as json', () =>
    expect(detectType({ key: 'val' })).toBe('json'));
  it('detects plain string', () => expect(detectType('hello')).toBe('string'));
  it('detects JSON string as json', () =>
    expect(detectType('{"a":1}')).toBe('json'));
  it('detects JSON array string as json', () =>
    expect(detectType('[1,2,3]')).toBe('json'));
  it('returns string for invalid JSON-like string', () =>
    expect(detectType('{invalid')).toBe('string'));
});

describe('normalizeMgmtFlags', () => {
  it('uses environment-specific defaultValue when env matches', () => {
    const flags = normalizeMgmtFlags([MGMT_FEATURES[0]], 'prod');
    expect(flags[0]).toMatchObject({
      key: 'boolean-flag',
      type: 'boolean',
      valuePreview: 'false',
    });
  });

  it('falls back to top-level defaultValue when env is missing', () => {
    const flags = normalizeMgmtFlags([MGMT_FEATURES[3]], 'prod');
    expect(flags[0]).toMatchObject({
      key: 'number-flag',
      type: 'number',
      valuePreview: '10',
    });
  });

  it('returns flags sorted alphabetically by key', () => {
    const flags = normalizeMgmtFlags(MGMT_FEATURES, 'prod');
    const keys = flags.map(f => f.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('sets valuePretty only for json type', () => {
    const flags = normalizeMgmtFlags(MGMT_FEATURES, 'prod');
    const jsonFlag = flags.find(f => f.key === 'json-flag')!;
    const boolFlag = flags.find(f => f.key === 'boolean-flag')!;
    expect(jsonFlag.valuePretty).toBeDefined();
    expect(boolFlag.valuePretty).toBeUndefined();
  });

  it('truncates long valuePreview to 80 chars', () => {
    const longJson = JSON.stringify({ data: 'x'.repeat(100) });
    const features: MgmtFeature[] = [
      {
        id: 'big-flag',
        project: 'p',
        valueType: 'json',
        defaultValue: longJson,
        environments: {},
      },
    ];
    const flags = normalizeMgmtFlags(features, 'prod');
    expect(flags[0].valuePreview.length).toBeLessThanOrEqual(80);
    expect(flags[0].valuePreview).toMatch(/\.\.\.$/);
  });
});

describe('normalizeSdkFlags', () => {
  it('normalizes boolean, number, string, and json flags', () => {
    const flags = normalizeSdkFlags({
      'bool-flag': { defaultValue: true },
      'num-flag': { defaultValue: 99 },
      'str-flag': { defaultValue: 'hello' },
      'json-flag': { defaultValue: { nested: true } },
    });

    expect(flags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'bool-flag',
          type: 'boolean',
          valuePreview: 'true',
        }),
        expect.objectContaining({
          key: 'num-flag',
          type: 'number',
          valuePreview: '99',
        }),
        expect.objectContaining({
          key: 'str-flag',
          type: 'string',
          valuePreview: '"hello"',
        }),
        expect.objectContaining({ key: 'json-flag', type: 'json' }),
      ]),
    );
  });

  it('returns flags sorted alphabetically', () => {
    const flags = normalizeSdkFlags({
      'z-flag': { defaultValue: true },
      'a-flag': { defaultValue: false },
    });
    expect(flags.map(f => f.key)).toEqual(['a-flag', 'z-flag']);
  });

  it('handles null defaultValue', () => {
    const flags = normalizeSdkFlags({ 'null-flag': { defaultValue: null } });
    expect(flags[0]).toMatchObject({ key: 'null-flag', type: 'null' });
  });
});

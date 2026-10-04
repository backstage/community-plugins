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
  MgmtExperiment,
  MgmtResults,
  MgmtFeatureDetail,
  normalizeExperiment,
  normalizeResults,
  normalizeFlagDetail,
  resolveAppUrl,
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

const EXPERIMENT: MgmtExperiment = {
  id: 'exp_1',
  name: 'Checkout button colour',
  status: 'running',
  type: 'standard',
  owner: 'alice',
  tags: ['checkout'],
  variations: [
    { variationId: 'v0', key: '0', name: 'Control' },
    { variationId: 'v1', key: '1', name: 'Green' },
  ],
  phases: [{ name: 'Main', dateStarted: '2026-09-01T00:00:00Z' }],
  resultSummary: { winner: '' },
};

describe('normalizeExperiment', () => {
  it('maps fields and builds a GrowthBook link', () => {
    expect(normalizeExperiment(EXPERIMENT, 'https://gb.example.com')).toEqual({
      id: 'exp_1',
      name: 'Checkout button colour',
      status: 'running',
      type: 'standard',
      owner: 'alice',
      tags: ['checkout'],
      variations: [
        { id: 'v0', key: '0', name: 'Control' },
        { id: 'v1', key: '1', name: 'Green' },
      ],
      phases: [{ name: 'Main', dateStarted: '2026-09-01T00:00:00Z' }],
      winnerVariationId: undefined,
      url: 'https://gb.example.com/experiment/exp_1',
    });
  });

  it('treats an empty winner string as no winner and keeps a real winner', () => {
    const withWinner = {
      ...EXPERIMENT,
      status: 'stopped',
      resultSummary: { winner: 'v1' },
    };
    expect(
      normalizeExperiment(withWinner, 'https://gb').winnerVariationId,
    ).toBe('v1');
    expect(
      normalizeExperiment(EXPERIMENT, 'https://gb').winnerVariationId,
    ).toBeUndefined();
  });

  it('falls back to draft for unknown status and tolerates missing arrays', () => {
    const sparse = {
      id: 'exp_2',
      name: 'x',
      status: 'weird',
      variations: [],
    } as MgmtExperiment;
    const row = normalizeExperiment(sparse, 'https://gb');
    expect(row.status).toBe('draft');
    expect(row.tags).toEqual([]);
    expect(row.phases).toEqual([]);
  });

  it('url-encodes the experiment id', () => {
    const row = normalizeExperiment(
      { ...EXPERIMENT, id: 'a/b c' },
      'https://gb',
    );
    expect(row.url).toBe('https://gb/experiment/a%2Fb%20c');
  });
});

describe('normalizeResults', () => {
  it('summarises the first metric, preferring the bayesian analysis', () => {
    const result: MgmtResults = {
      results: [
        {
          metrics: [
            {
              metricId: 'm1',
              metricName: 'Purchase rate',
              variations: [
                {
                  variationId: 'v0',
                  variationName: 'Control',
                  users: 1000,
                  analyses: [{ engine: 'bayesian' }],
                },
                {
                  variationId: 'v1',
                  users: 990,
                  analyses: [
                    { engine: 'frequentist', percentChange: 0.5 },
                    {
                      engine: 'bayesian',
                      percentChange: 0.12,
                      ciLow: 0.02,
                      ciHigh: 0.22,
                      chanceToBeatControl: 0.97,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(normalizeResults(EXPERIMENT, result)).toEqual({
      available: true,
      metricName: 'Purchase rate',
      variations: [
        { id: 'v0', name: 'Control', users: 1000 },
        {
          id: 'v1',
          name: 'Green',
          users: 990,
          percentChange: 0.12,
          ciLow: 0.02,
          ciHigh: 0.22,
          chanceToBeatControl: 0.97,
        },
      ],
    });
  });

  it.each([
    ['no results key', {}],
    ['empty results', { results: [] }],
    ['no metrics', { results: [{ totalUsers: 10 }] }],
    ['empty metrics', { results: [{ metrics: [] }] }],
  ])('is unavailable when %s', (_label, result) => {
    expect(normalizeResults(EXPERIMENT, result as MgmtResults)).toEqual({
      available: false,
      variations: [],
    });
  });
});

describe('normalizeFlagDetail', () => {
  const FEATURE: MgmtFeatureDetail = {
    id: 'my-flag',
    dateUpdated: '2026-09-20T10:00:00Z',
    archived: false,
    owner: 'bob',
    tags: ['beta'],
    environments: {
      prod: {
        enabled: true,
        rules: [
          { id: 'fr_1', type: 'force', description: 'EU only', enabled: true },
          { type: 'rollout' },
        ],
      },
      dev: { enabled: false, rules: [] },
    },
  };

  it('maps environments sorted by name and defaults rule enabled to true', () => {
    const detail = normalizeFlagDetail(FEATURE, {
      isStale: true,
      staleReason: 'no-rules',
    });
    expect(detail).toEqual({
      key: 'my-flag',
      dateUpdated: '2026-09-20T10:00:00Z',
      archived: false,
      owner: 'bob',
      tags: ['beta'],
      isStale: true,
      staleReason: 'no-rules',
      environments: [
        { name: 'dev', enabled: false, rules: [] },
        {
          name: 'prod',
          enabled: true,
          rules: [
            { type: 'force', description: 'EU only', enabled: true },
            { type: 'rollout', description: undefined, enabled: true },
          ],
        },
      ],
    });
  });

  it('reports not stale when stale info is missing', () => {
    const detail = normalizeFlagDetail(FEATURE, undefined);
    expect(detail.isStale).toBe(false);
    expect(detail.staleReason).toBeUndefined();
  });

  it('drops a null stale reason and skips undefined environments', () => {
    const detail = normalizeFlagDetail(
      { ...FEATURE, environments: { prod: undefined } },
      { isStale: false, staleReason: null },
    );
    expect(detail.staleReason).toBeUndefined();
    expect(detail.environments).toEqual([]);
  });
});

describe('resolveAppUrl', () => {
  it('uses the configured app URL without trailing slashes', () => {
    expect(resolveAppUrl('https://app.growthbook.io//', 'https://api.gb')).toBe(
      'https://app.growthbook.io',
    );
  });

  it('falls back to the base URL when no app URL is configured', () => {
    expect(resolveAppUrl(undefined, 'https://api.gb')).toBe('https://api.gb');
    expect(resolveAppUrl('', 'https://api.gb')).toBe('https://api.gb');
  });
});

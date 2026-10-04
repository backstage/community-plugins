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

import type {
  ExperimentResultSummary,
  ExperimentRow,
  ExperimentStatus,
  ExperimentVariationResult,
  FlagDetail,
  FlagEnvironmentDetail,
  FlagRow,
  FlagRuleSummary,
  FlagType,
} from '@backstage-community/plugin-growthbook-common';

export type MgmtFeature = {
  id: string;
  project: string;
  valueType: string;
  defaultValue: string;
  environments: Record<
    string,
    { enabled: boolean; defaultValue: string } | undefined
  >;
};

export function mgmtTypeToFlagType(valueType: string): FlagType {
  if (valueType === 'boolean') return 'boolean';
  if (valueType === 'number') return 'number';
  if (valueType === 'json') return 'json';
  if (valueType === 'string') return 'string';
  return 'null';
}

export function resolveRawValue(rawStr: string, type: FlagType): unknown {
  if (type === 'boolean') return rawStr === 'true';
  if (type === 'number') return Number(rawStr);
  if (type === 'json') {
    try {
      return JSON.parse(rawStr);
    } catch {
      return rawStr;
    }
  }
  return rawStr;
}

export function normalizeMgmtFlags(
  features: MgmtFeature[],
  env: string,
): FlagRow[] {
  return features
    .map(f => {
      const envData = f.environments[env];
      const rawStr = envData?.defaultValue ?? f.defaultValue;
      const type = mgmtTypeToFlagType(f.valueType);
      const resolved = resolveRawValue(rawStr, type);

      const serialized = JSON.stringify(resolved) ?? 'null';
      const valuePreview =
        serialized.length > 80 ? `${serialized.slice(0, 77)}...` : serialized;
      const valuePretty =
        type === 'json' ? JSON.stringify(resolved, null, 2) : undefined;

      return { key: f.id, type, valuePreview, valuePretty };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

/** Detect flag type from the raw SDK payload (fallback path, no secretKey) */
export function detectType(value: unknown): FlagType {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object') return 'json';
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.startsWith('{') || t.startsWith('[')) {
      try {
        JSON.parse(t);
        return 'json';
      } catch {
        /* fall through */
      }
    }
  }
  return 'string';
}

export function normalizeSdkFlags(
  features: Record<string, { defaultValue: unknown }>,
): FlagRow[] {
  return Object.entries(features)
    .map(([key, feature]) => {
      const raw = feature.defaultValue;
      const type = detectType(raw);
      let resolved: unknown = raw;
      if (type === 'json' && typeof raw === 'string')
        resolved = JSON.parse(raw);
      const serialized = JSON.stringify(resolved) ?? 'null';
      const valuePreview =
        serialized.length > 80 ? `${serialized.slice(0, 77)}...` : serialized;
      const valuePretty =
        type === 'json' ? JSON.stringify(resolved, null, 2) : undefined;
      return { key, type, valuePreview, valuePretty };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

export type MgmtExperiment = {
  id: string;
  name: string;
  status: string;
  type?: string;
  owner?: string;
  tags?: string[];
  variations: { variationId: string; key: string; name: string }[];
  phases?: { name: string; dateStarted?: string; dateEnded?: string }[];
  resultSummary?: { winner?: string };
};

type MgmtAnalysis = {
  engine: string;
  percentChange?: number;
  ciLow?: number;
  ciHigh?: number;
  chanceToBeatControl?: number;
};

export type MgmtResults = {
  results?: {
    totalUsers?: number;
    metrics?: {
      metricId: string;
      metricName?: string;
      variations: {
        variationId: string;
        variationName?: string;
        users?: number;
        analyses?: MgmtAnalysis[];
      }[];
    }[];
  }[];
};

export type MgmtFeatureDetail = {
  id: string;
  dateUpdated?: string;
  archived?: boolean;
  owner?: string;
  tags?: string[];
  environments: Record<
    string,
    | {
        enabled: boolean;
        rules?: {
          id?: string;
          type?: string;
          description?: string;
          enabled?: boolean;
        }[];
      }
    | undefined
  >;
};

export type MgmtStale = { isStale: boolean; staleReason?: string | null };

const EXPERIMENT_STATUSES: ExperimentStatus[] = ['draft', 'running', 'stopped'];

export function normalizeExperiment(
  e: MgmtExperiment,
  appUrl: string,
): ExperimentRow {
  const status = EXPERIMENT_STATUSES.find(s => s === e.status) ?? 'draft';
  return {
    id: e.id,
    name: e.name,
    status,
    type: e.type,
    owner: e.owner,
    tags: e.tags ?? [],
    variations: e.variations.map(v => ({
      id: v.variationId,
      key: v.key,
      name: v.name,
    })),
    phases: (e.phases ?? []).map(p => ({
      name: p.name,
      dateStarted: p.dateStarted,
      dateEnded: p.dateEnded,
    })),
    winnerVariationId: e.resultSummary?.winner || undefined,
    url: `${appUrl}/experiment/${encodeURIComponent(e.id)}`,
  };
}

export function normalizeResults(
  experiment: MgmtExperiment,
  result: MgmtResults,
): ExperimentResultSummary {
  const metric = result.results?.[0]?.metrics?.[0];
  if (!metric) return { available: false, variations: [] };

  const variations = metric.variations.map((v): ExperimentVariationResult => {
    const analysis =
      v.analyses?.find(a => a.engine === 'bayesian') ?? v.analyses?.[0];
    const name =
      v.variationName ??
      experiment.variations.find(ev => ev.variationId === v.variationId)
        ?.name ??
      v.variationId;
    return {
      id: v.variationId,
      name,
      users: v.users,
      percentChange: analysis?.percentChange,
      ciLow: analysis?.ciLow,
      ciHigh: analysis?.ciHigh,
      chanceToBeatControl: analysis?.chanceToBeatControl,
    };
  });
  return { available: true, metricName: metric.metricName, variations };
}

export function normalizeFlagDetail(
  feature: MgmtFeatureDetail,
  stale: MgmtStale | undefined,
): FlagDetail {
  const environments = Object.entries(feature.environments)
    .flatMap(([name, env]): FlagEnvironmentDetail[] =>
      env
        ? [
            {
              name,
              enabled: env.enabled,
              rules: (env.rules ?? []).map(
                (r): FlagRuleSummary => ({
                  type: r.type ?? 'unknown',
                  description: r.description,
                  enabled: r.enabled ?? true,
                }),
              ),
            },
          ]
        : [],
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    key: feature.id,
    dateUpdated: feature.dateUpdated,
    archived: feature.archived ?? false,
    owner: feature.owner,
    tags: feature.tags ?? [],
    isStale: stale?.isStale ?? false,
    staleReason: stale?.staleReason ?? undefined,
    environments,
  };
}

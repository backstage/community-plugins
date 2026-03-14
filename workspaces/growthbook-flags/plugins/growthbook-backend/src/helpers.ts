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
  FlagType,
  FlagRow,
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

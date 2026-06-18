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

/**
 * Returns true if a dimension value represents the special "others" bucket
 * that the GitHub Copilot API emits for aggregated/unrecognised entries.
 */
export function isOthersValue(value: string): boolean {
  return value.toLowerCase() === 'others';
}

/**
 * Formats a number into a compact human-readable string.
 * e.g. 1500 → "1.5k", 1200000 → "1.2M"
 */
export function compactNumber(v: number | null): string {
  if (v === null || v === undefined) return '';
  if (Math.abs(v) >= 1_000_000)
    return `${Math.round((v / 1_000_000) * 10) / 10}M`;
  if (Math.abs(v) >= 1_000) return `${Math.round((v / 1_000) * 10) / 10}k`;
  return String(v);
}

/**
 * Formats a YYYY-MM-DD date string as "Month Day" e.g. "May 22".
 */
export function formatDay(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Shared x-axis tick label style: 45° angle to give room for date labels. */
export const DATE_TICK_LABEL_STYLE = {
  angle: -45,
  textAnchor: 'end',
  fontSize: 12,
  dominantBaseline: 'hanging',
};

/**
 * Maps raw GitHub Copilot API feature keys to human-readable display labels.
 * Returns the raw key unchanged if no mapping exists.
 */
export const CHAT_FEATURE_LABELS: Record<string, string> = {
  chat_inline: 'Inline',
  chat_panel_edit_mode: 'Edit',
  chat_panel_ask_mode: 'Ask',
  chat_panel_plan_mode: 'Plan',
  chat_panel_agent_mode: 'Agent',
  chat_panel_custom_mode: 'Custom',
};

export const FEATURE_LABELS: Record<string, string> = {
  ...CHAT_FEATURE_LABELS,
  code_completion: 'Completions',
  copilot_cli: 'CLI',
  agent_edit: 'Agent',
};

export const AGENT_CODE_CHANGE_FEATURES = new Set([
  'agent_edit',
  'chat_panel_edit_mode',
  'chat_panel_agent_mode',
  'chat_panel_custom_mode',
]);

export const DROPPED_LOC_FEATURES = new Set([
  'chat_panel_unknown_mode',
  'chat_panel_plan_mode',
  'others',
]);

/**
 * Feature keys that should be excluded from chat-mode charts entirely.
 */
export const DROPPED_CHAT_FEATURES = new Set([
  'code_completion',
  'chat_panel_unknown_mode',
  'copilot_cli',
  'agent_edit',
]);

type FeatureRow = {
  feature: string;
};

type ChatModelRow = {
  feature: string;
  model_id: string;
  user_initiated_interaction_count: number;
};

/** Returns the display label for a chat feature key. */
export function chatFeatureLabel(feature: string): string {
  return CHAT_FEATURE_LABELS[feature] ?? feature;
}

export function featureLabel(feature: string): string {
  return FEATURE_LABELS[feature] ?? feature;
}

export function isChatFeature(feature: string): boolean {
  return Object.hasOwn(CHAT_FEATURE_LABELS, feature);
}

export function isAgentCodeChangeFeature(feature: string): boolean {
  return AGENT_CODE_CHANGE_FEATURES.has(feature);
}

/**
 * Feature keys used by the model-level LOC charts to classify agent rows.
 * Intentionally narrower than {@link AGENT_CODE_CHANGE_FEATURES}: the model
 * breakdown only splits on pure agent-driven features (not chat edit modes).
 */
export const MODEL_AGENT_FEATURES = new Set(['agent_edit', 'copilot_cli']);

export function isAgentModelFeature(feature: string): boolean {
  return MODEL_AGENT_FEATURES.has(feature);
}

/** Shared color tokens for user-initiated LOC charts. */
export const USER_LOC_COLORS = {
  suggested: '#81C784',
  added: '#2E7D32',
} as const;

/** Shared color tokens for agent-initiated LOC charts. */
export const AGENT_LOC_COLORS = {
  added: '#CE93D8',
  deleted: '#7B1FA2',
} as const;

interface LocRow {
  loc_suggested_to_add_sum?: number | null;
  loc_added_sum?: number | null;
  loc_deleted_sum?: number | null;
}

/**
 * Aggregates LOC metrics into a map keyed by the value returned by getKey.
 * Returns Map<key, { suggested, added, deleted }>.
 */
export function aggregateLocTotals<T extends LocRow>(
  rows: T[],
  getKey: (row: T) => string,
): Map<string, { suggested: number; added: number; deleted: number }> {
  const totals = new Map<
    string,
    { suggested: number; added: number; deleted: number }
  >();
  for (const row of rows) {
    const key = getKey(row);
    const existing = totals.get(key) ?? { suggested: 0, added: 0, deleted: 0 };
    totals.set(key, {
      suggested: existing.suggested + (row.loc_suggested_to_add_sum ?? 0),
      added: existing.added + (row.loc_added_sum ?? 0),
      deleted: existing.deleted + (row.loc_deleted_sum ?? 0),
    });
  }
  return totals;
}

export function filterChatRows<T extends FeatureRow>(rows: T[]): T[] {
  return rows.filter(row => isChatFeature(row.feature));
}

export function filterLocRowsByMode<T extends FeatureRow>(
  rows: T[],
  mode: 'user' | 'agent',
): T[] {
  return rows.filter(row => {
    if (DROPPED_LOC_FEATURES.has(row.feature)) {
      return false;
    }

    return mode === 'agent'
      ? isAgentCodeChangeFeature(row.feature)
      : !isAgentCodeChangeFeature(row.feature);
  });
}

export function getChatModelTotals(rows: ChatModelRow[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const row of filterChatRows(rows)) {
    if (isOthersValue(row.model_id)) {
      continue;
    }

    totals.set(
      row.model_id,
      (totals.get(row.model_id) ?? 0) + row.user_initiated_interaction_count,
    );
  }

  return totals;
}

export function getMostUsedChatModel(rows: ChatModelRow[]): string {
  return (
    [...getChatModelTotals(rows).entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] ?? 'N/A'
  );
}

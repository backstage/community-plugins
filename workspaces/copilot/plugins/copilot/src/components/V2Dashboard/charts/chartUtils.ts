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

/**
 * Feature keys that should be excluded from chat-mode charts entirely.
 */
export const DROPPED_CHAT_FEATURES = new Set([
  'code_completion',
  'chat_panel_unknown_mode',
  'copilot_cli',
  'agent_edit',
]);

/** Returns the display label for a chat feature key. */
export function chatFeatureLabel(feature: string): string {
  return CHAT_FEATURE_LABELS[feature] ?? feature;
}

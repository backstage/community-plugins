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

import { DateTime, Duration } from 'luxon';
import type { Workflow } from '@backstage-community/plugin-argo-workflows-common';
import type { WorkflowStatus } from '@backstage-community/plugin-argo-workflows-common';

/** Table item type — extends Workflow with a required `id` and source instance. */
export interface WorkflowItem extends Workflow {
  id: string;
  /** The instance this workflow was fetched from. */
  sourceInstance?: string;
}

/** All possible workflow status values for the filter toggles. */
export const ALL_STATUSES: WorkflowStatus[] = [
  'Succeeded',
  'Failed',
  'Running',
  'Pending',
  'Error',
];

/** Placeholder for missing/invalid values. */
const EMPTY_VALUE = '—';

/**
 * Formats a duration between two ISO date strings into a human-readable string.
 * Uses Luxon Duration for consistent formatting per ADR010.
 * Returns '—' if either date is missing or the duration is negative.
 */
export function formatDuration(
  startedAt?: string,
  finishedAt?: string,
): string {
  if (!startedAt || !finishedAt) return EMPTY_VALUE;
  const start = DateTime.fromISO(startedAt);
  const end = DateTime.fromISO(finishedAt);
  if (!start.isValid || !end.isValid) return EMPTY_VALUE;
  const diffMs = end.toMillis() - start.toMillis();
  if (diffMs < 0) return EMPTY_VALUE;
  return formatMilliseconds(diffMs);
}

/**
 * Formats a duration given in seconds into a human-readable string.
 * Uses Luxon Duration for consistent formatting per ADR010.
 * Returns '—' if the value is undefined or null.
 */
export function formatDurationSeconds(seconds?: number | null): string {
  if (seconds === undefined || seconds === null) return EMPTY_VALUE;
  return formatMilliseconds(seconds * 1000);
}

/**
 * Formats an ISO date string into a localized date/time string.
 * Uses Luxon DateTime.toLocaleString with DATETIME_SHORT preset per ADR012.
 */
export function formatDate(isoDate?: string): string {
  if (!isoDate) return EMPTY_VALUE;
  const dt = DateTime.fromISO(isoDate);
  if (!dt.isValid) return EMPTY_VALUE;
  return dt.toLocaleString(DateTime.DATETIME_SHORT);
}

/**
 * Returns a human-readable relative time string (e.g. "Updated just now").
 * Uses Luxon Duration for the time difference calculation.
 */
export function formatTimeAgo(date: Date): string {
  const now = DateTime.now();
  const then = DateTime.fromJSDate(date);
  const diff = now.diff(then, 'seconds');
  const seconds = Math.floor(diff.seconds);
  if (seconds < 10) return 'Updated just now';
  if (seconds < 60) return `Updated ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `Updated ${hours}h ago`;
}

/**
 * Returns the full qualified name of a workflow: `namespace/name`.
 */
export function workflowFullName(item: WorkflowItem): string {
  return `${item.metadata.namespace}/${item.metadata.name}`;
}

/**
 * Returns a BUI CSS custom property color for a given workflow status.
 * Used consistently across DAG nodes, status icons, and tooltips.
 */
export function statusColor(status: WorkflowStatus): string {
  switch (status) {
    case 'Succeeded':
      return 'var(--bui-fg-success)';
    case 'Failed':
    case 'Error':
      return 'var(--bui-fg-danger)';
    case 'Running':
      return 'var(--bui-fg-info)';
    case 'Pending':
    default:
      return 'var(--bui-fg-secondary)';
  }
}

/**
 * Formats milliseconds into a compact human-readable duration string.
 * Uses Luxon Duration.shiftTo for proper unit decomposition.
 */
function formatMilliseconds(ms: number): string {
  const duration = Duration.fromMillis(ms).shiftTo(
    'hours',
    'minutes',
    'seconds',
  );
  const hours = Math.floor(duration.hours);
  const minutes = Math.floor(duration.minutes);
  const seconds = Math.floor(duration.seconds);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

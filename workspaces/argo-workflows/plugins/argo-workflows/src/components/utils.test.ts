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
  ALL_STATUSES,
  formatDuration,
  formatDurationSeconds,
  formatDate,
  formatTimeAgo,
  statusColor,
  workflowFullName,
} from './utils';
import type { WorkflowItem } from './utils';
import { makeWorkflowItem } from './testUtils';
import { succeededWorkflow } from '../__fixtures__';

describe('ALL_STATUSES', () => {
  it('contains all five workflow statuses', () => {
    expect(ALL_STATUSES).toEqual([
      'Succeeded',
      'Failed',
      'Running',
      'Pending',
      'Error',
    ]);
  });
});

describe('formatDuration', () => {
  // Invalid inputs
  it('returns dash when startedAt is missing', () => {
    expect(formatDuration(undefined, '2024-01-01T00:01:00Z')).toBe('—');
  });

  it('returns dash when finishedAt is missing', () => {
    expect(formatDuration('2024-01-01T00:00:00Z', undefined)).toBe('—');
  });

  it('returns dash when both are missing', () => {
    expect(formatDuration()).toBe('—');
  });

  it('returns dash for negative duration', () => {
    expect(formatDuration('2024-01-01T00:01:00Z', '2024-01-01T00:00:00Z')).toBe(
      '—',
    );
  });

  // Valid inputs — increasing complexity
  it('formats zero seconds as 0s', () => {
    expect(formatDuration('2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')).toBe(
      '0s',
    );
  });

  it('formats seconds only', () => {
    expect(formatDuration('2024-01-01T00:00:00Z', '2024-01-01T00:00:45Z')).toBe(
      '45s',
    );
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration('2024-01-01T00:00:00Z', '2024-01-01T00:02:30Z')).toBe(
      '2m 30s',
    );
  });

  it('formats hours, minutes and seconds', () => {
    expect(formatDuration('2024-01-01T00:00:00Z', '2024-01-01T01:15:05Z')).toBe(
      '1h 15m 5s',
    );
  });

  it('computes duration from a real fixture', () => {
    // succeededWorkflow ran from 14:33:18 to 14:57:34 = 24m 16s
    const result = formatDuration(
      succeededWorkflow.status.startedAt,
      succeededWorkflow.status.finishedAt,
    );
    expect(result).toBe('24m 16s');
  });
});

describe('formatDurationSeconds', () => {
  // Invalid inputs
  it('returns dash when undefined', () => {
    expect(formatDurationSeconds(undefined)).toBe('—');
  });

  it('returns dash when null', () => {
    expect(formatDurationSeconds(null)).toBe('—');
  });

  // Valid inputs — increasing complexity
  it('formats zero seconds', () => {
    expect(formatDurationSeconds(0)).toBe('0s');
  });

  it('formats seconds only', () => {
    expect(formatDurationSeconds(45)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDurationSeconds(150)).toBe('2m 30s');
  });

  it('formats hours, minutes and seconds', () => {
    expect(formatDurationSeconds(4505)).toBe('1h 15m 5s');
  });
});

describe('formatDate', () => {
  it('returns dash when isoDate is undefined', () => {
    expect(formatDate()).toBe('—');
  });

  it('returns a non-empty localized string for a fixture date', () => {
    const result = formatDate(succeededWorkflow.status.startedAt);
    expect(result).not.toBe('—');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatTimeAgo', () => {
  it('returns "Updated just now" for recent dates', () => {
    const now = new Date();
    expect(formatTimeAgo(now)).toBe('Updated just now');
  });

  it('returns seconds ago for dates within a minute', () => {
    const thirtySecondsAgo = new Date(Date.now() - 30_000);
    expect(formatTimeAgo(thirtySecondsAgo)).toBe('Updated 30s ago');
  });

  it('returns minutes ago for dates within an hour', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000);
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('Updated 5m ago');
  });

  it('returns hours ago for older dates', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600_000);
    expect(formatTimeAgo(twoHoursAgo)).toBe('Updated 2h ago');
  });
});

describe('statusColor', () => {
  it('returns success color for Succeeded', () => {
    expect(statusColor('Succeeded')).toBe('var(--bui-fg-success)');
  });

  it('returns danger color for Failed', () => {
    expect(statusColor('Failed')).toBe('var(--bui-fg-danger)');
  });

  it('returns danger color for Error', () => {
    expect(statusColor('Error')).toBe('var(--bui-fg-danger)');
  });

  it('returns info color for Running', () => {
    expect(statusColor('Running')).toBe('var(--bui-fg-info)');
  });

  it('returns secondary color for Pending', () => {
    expect(statusColor('Pending')).toBe('var(--bui-fg-secondary)');
  });

  it('returns secondary color for unknown status', () => {
    expect(statusColor('Unknown' as any)).toBe('var(--bui-fg-secondary)');
  });
});

describe('workflowFullName', () => {
  it('returns namespace/name from a fixture-based item', () => {
    const item: WorkflowItem = {
      ...succeededWorkflow,
      id: succeededWorkflow.metadata.name,
    };
    expect(workflowFullName(item)).toBe(
      `${succeededWorkflow.metadata.namespace}/${succeededWorkflow.metadata.name}`,
    );
  });

  it('returns namespace/name with overrides', () => {
    const item = makeWorkflowItem({
      namespace: 'production',
      name: 'deploy-v42',
    });
    expect(workflowFullName(item)).toBe('production/deploy-v42');
  });
});

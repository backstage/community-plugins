/*
 * Copyright 2025 The Backstage Authors
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

import { formatDate } from './acr-utils';
import { DateTime } from 'luxon';

describe('formatDate', () => {
  it('returns "N/A" when the input is undefined', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('returns "N/A" when the input is -1', () => {
    expect(formatDate(-1)).toBe('N/A');
  });

  it('returns "N/A" for an invalid ISO string', () => {
    expect(formatDate('not-a-date')).toBe('N/A');
  });

  it('returns "N/A" for an invalid Date instance', () => {
    expect(formatDate(new Date('invalid date'))).toBe('N/A');
  });

  it('correctly formats a Unix timestamp (seconds)', () => {
    const unixSeconds = 1_759_761_000; // 2025-12-06T05:30:00Z
    const expected = DateTime.fromSeconds(unixSeconds).toFormat(
      'MMM d, yyyy, h:mm a',
    );
    expect(formatDate(unixSeconds)).toBe(expected);
  });

  it('correctly formats an ISO-8601 string', () => {
    const iso = '2025-06-09T18:15:00';
    const expected = DateTime.fromISO(iso).toLocaleString(
      DateTime.DATETIME_MED,
    );
    expect(formatDate(iso)).toBe(expected);
  });

  it('correctly formats a Date object', () => {
    const dateObj = new Date('2025-06-09T18:15:00');
    const expected = DateTime.fromJSDate(dateObj).toFormat(
      'MMM d, yyyy, h:mm a',
    );
    expect(formatDate(dateObj)).toBe(expected);
  });
  it('formats an ISO string with fractional seconds and Z suffix (UTC)', () => {
    const isoZ = '2024-01-29T08:07:53.1204155Z';
    const expected = DateTime.fromISO(isoZ).toLocaleString(
      DateTime.DATETIME_MED,
    );
    expect(formatDate(isoZ)).toBe(expected);
  });
});

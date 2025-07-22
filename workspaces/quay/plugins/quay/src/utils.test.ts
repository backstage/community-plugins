/*
 * Copyright 2024 The Backstage Authors
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

import { DateTime } from 'luxon';

import { formatByteSize, formatDate } from './utils';

describe('formatByteSize', () => {
  it('should return N/A if sizeInBytes is not defined', () => {
    expect(formatByteSize(undefined)).toEqual('N/A');
  });

  it('should return N/A if sizeInBytes is 0', () => {
    expect(formatByteSize(0)).toEqual('N/A');
  });

  it('should format sizeInBytes', () => {
    expect(formatByteSize(1)).toEqual('1 B');
    expect(formatByteSize(1_000)).toEqual('1 kB');
    expect(formatByteSize(1_000_000)).toEqual('1 MB');
    expect(formatByteSize(1_000_000_000)).toEqual('1 GB');
    expect(formatByteSize(1_000_000_000_000)).toEqual('1 TB');
    expect(formatByteSize(1_000_000_000_000_000)).toEqual('1 PB');
    expect(formatByteSize(1_000_000_000_000_000_000)).toEqual('1 EB');
    expect(formatByteSize(1_000_000_000_000_000_000_000)).toEqual('1 ZB');
    expect(formatByteSize(1_000_000_000_000_000_000_000_000)).toEqual('1 YB');
  });

  it('formats common sizes correctly', () => {
    expect(formatByteSize(500)).toEqual('500 B');
    expect(formatByteSize(1500)).toMatch('1.5 kB');
    expect(formatByteSize(1048576)).toMatch('1.05 MB');
  });
});

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
    const expected = DateTime.fromSeconds(unixSeconds).toLocaleString(
      DateTime.DATETIME_MED,
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
    const expected = DateTime.fromJSDate(dateObj).toLocaleString(
      DateTime.DATETIME_MED,
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

  it('correctly formats an RFC 2822 string', () => {
    const rfc2822 = 'Tue, 06 Feb 2024 09:39:24 -0000';
    const expected = DateTime.fromRFC2822(rfc2822).toLocaleString(
      DateTime.DATETIME_MED,
    );
    expect(formatDate(rfc2822)).toBe(expected);
  });
});

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
import { DateTime } from 'luxon';
import { formatDate } from './dateUtils';

describe('dateUtils', () => {
  it('returns "date not available" when input is undefined', () => {
    expect(formatDate(undefined)).toBe('date not available');
  });

  it('returns ISO string when input is a Date instance', () => {
    const date = new Date('2025-11-05T13:04:40.712Z');

    expect(formatDate(date)).toBe(DateTime.fromJSDate(date).toUTC().toISO());
  });

  it('returns ISO string when input is an ISO string', () => {
    const isoString = '2025-11-05T00:00:00.000Z';

    expect(formatDate(isoString)).toBe(
      DateTime.fromISO(isoString).toUTC().toISO(),
    );
  });
});

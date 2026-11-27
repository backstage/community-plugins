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

import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats valid dates as YYYY-MM-DD in local time and rejects invalid ones', () => {
    // Zero-padded month and day
    expect(formatDate(new Date(2024, 0, 5))).toBe('2024-01-05');
    // Two-digit month and day
    expect(formatDate(new Date(2023, 11, 31))).toBe('2023-12-31');
    // Uses the local date, even late in the day
    expect(formatDate(new Date(2024, 1, 29, 23, 59, 59))).toBe('2024-02-29');

    expect(formatDate(new Date('not a date'))).toBeUndefined();
    expect(formatDate(undefined as unknown as Date)).toBeUndefined();
  });
});

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
import { getTimeFromNow } from './dates';

describe('getTimeFromNow', () => {
  const mockDate = (isoDate: string) => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(dateString?: string) {
        super();
        if (dateString) {
          return new RealDate(dateString);
        }
        return new RealDate(isoDate);
      }
    } as typeof Date;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns N/A', () => {
    expect(getTimeFromNow(undefined)).toBe('N/A');
  });

  it('returns correct relative time for weeks', () => {
    mockDate('2024-06-25T00:00:00Z');
    expect(getTimeFromNow('2024-06-17T00:00:00Z')).toBe('1 week ago');
  });

  it('returns correct relative time for days', () => {
    mockDate('2023-01-03T00:00:00Z');
    expect(getTimeFromNow('2023-01-01T00:00:00Z')).toBe('2 days ago');
  });

  it('returns correct relative time for minutes', () => {
    mockDate('2023-01-01T00:10:00Z');
    expect(getTimeFromNow('2023-01-01T00:05:00Z')).toBe('5 minutes ago');
  });

  it('returns correct relative time for seconds', () => {
    mockDate('2023-01-01T00:00:10Z');
    expect(getTimeFromNow('2023-01-01T00:00:00Z')).toBe('10 seconds ago');
  });
});

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

import { formatRelativeTime } from './formatTime';

describe('formatRelativeTime', () => {
  const baseTime = new Date('2025-02-28T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(baseTime);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recent timestamps', () => {
    it('returns "just now" for timestamps within the last minute', () => {
      const thirtySecondsAgo = new Date('2025-02-28T11:59:30.000Z');
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');

      const oneSecondAgo = new Date('2025-02-28T11:59:59.000Z');
      expect(formatRelativeTime(oneSecondAgo)).toBe('just now');
    });

    it('returns "X minutes ago" for timestamps within the last hour', () => {
      const fiveMinutesAgo = new Date('2025-02-28T11:55:00.000Z');
      expect(formatRelativeTime(fiveMinutesAgo)).toMatch(/5.*minute/);

      const thirtyMinutesAgo = new Date('2025-02-28T11:30:00.000Z');
      expect(formatRelativeTime(thirtyMinutesAgo)).toMatch(/30.*minute/);
    });
  });

  describe('older timestamps', () => {
    it('returns "X hours ago" for timestamps within the last 24 hours', () => {
      const twoHoursAgo = new Date('2025-02-28T10:00:00.000Z');
      expect(formatRelativeTime(twoHoursAgo)).toMatch(/2.*hour/);

      const twelveHoursAgo = new Date('2025-02-28T00:00:00.000Z');
      expect(formatRelativeTime(twelveHoursAgo)).toMatch(/12.*hour/);
    });

    it('returns absolute time for timestamps older than 24 hours', () => {
      const twoDaysAgo = new Date('2025-02-26T12:00:00.000Z');
      const result = formatRelativeTime(twoDaysAgo);
      // Falls back to toLocaleTimeString with month, day, hour, minute
      expect(result).toMatch(/Feb/);
      expect(result).toMatch(/26/);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('edge cases', () => {
    it('throws when given null (no runtime guard)', () => {
      expect(() => formatRelativeTime(null as unknown as Date)).toThrow();
    });

    it('throws when given undefined (no runtime guard)', () => {
      expect(() => formatRelativeTime(undefined as unknown as Date)).toThrow();
    });

    it('handles invalid Date by returning string (NaN diff falls through)', () => {
      const invalidDate = new Date('invalid');
      const result = formatRelativeTime(invalidDate);
      expect(typeof result).toBe('string');
    });

    it('handles future dates by returning formatted string', () => {
      const fiveMinutesFromNow = new Date('2025-02-28T12:05:00.000Z');
      const result = formatRelativeTime(fiveMinutesFromNow);
      // diff is negative, -Math.floor(diff/MINUTE) is positive
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns "just now" for current time', () => {
      expect(formatRelativeTime(baseTime)).toBe('just now');
    });

    it('returns absolute format for exactly 24 hours ago', () => {
      const exactlyOneDayAgo = new Date('2025-02-27T12:00:00.000Z');
      const result = formatRelativeTime(exactlyOneDayAgo);
      expect(result).toMatch(/Feb/);
      expect(result).toMatch(/27/);
    });
  });
});

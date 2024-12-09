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
import { fromNow, getDuration } from './datetime';

describe('getDuration', () => {
  it('should return correct duration object', () => {
    expect(getDuration(0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expect(getDuration(1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
    expect(getDuration(60000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 0,
    });
    expect(getDuration(3600000)).toEqual({
      days: 0,
      hours: 1,
      minutes: 0,
      seconds: 0,
    });
    expect(getDuration(86400000)).toEqual({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expect(getDuration(90061000)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
  });

  it('should handle negative or null input', () => {
    expect(getDuration(-1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expect(getDuration(null)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('fromNow', () => {
  const now = new Date('2023-06-06T12:00:00');

  it('should return "-" when dateTime is null', () => {
    expect(fromNow(null, now)).toBe('-');
  });

  it('should return "Just now" for clock drift', () => {
    expect(fromNow('2023-06-06T11:59:30', now)).toBe('Just now');
  });

  it('should return "-" for future dates', () => {
    expect(fromNow('2023-06-07T12:00:00', now)).toBe('-');
  });

  it('should return formatted time with suffix when omitSuffix option is provided', () => {
    expect(fromNow('2023-06-05T12:00:00', now, { omitSuffix: true })).toBe(
      '1 day',
    );
    expect(fromNow('2023-06-06T11:00:00', now, { omitSuffix: true })).toBe(
      '1 hour',
    );
    expect(fromNow('2023-06-06T11:59:00', now, { omitSuffix: true })).toBe(
      '1 minute',
    );
  });
});

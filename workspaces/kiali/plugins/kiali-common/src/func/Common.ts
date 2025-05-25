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
import { defaultMetricsDuration } from '../';
import { BoundsInMilliseconds, DurationInSeconds, TimeRange } from '../types';

export const boundsToDuration = (
  bounds: BoundsInMilliseconds,
): DurationInSeconds => {
  return Math.floor(
    ((bounds.to || new Date().getTime()) -
      (bounds.from || new Date().getTime())) /
      1000,
  );
};

export const durationToBounds = (
  duration: DurationInSeconds,
): BoundsInMilliseconds => {
  return {
    from: new Date().getTime() - duration * 1000,
  };
};

export const isEqualTimeRange = (t1: TimeRange, t2: TimeRange): boolean => {
  if (t1.from && t2.from && t1.from !== t2.from) {
    return false;
  }
  if (t1.to && t2.to && t1.to !== t2.to) {
    return false;
  }
  if (
    t1.rangeDuration &&
    t2.rangeDuration &&
    t1.rangeDuration !== t2.rangeDuration
  ) {
    return false;
  }
  return true;
};

// Type-guarding TimeRange: executes first callback when range is a duration, or second callback when it's a bounded range, mapping to a value
export function guardTimeRange<T>(
  range: TimeRange,
  ifDuration: (d: DurationInSeconds) => T,
  ifBounded: (b: BoundsInMilliseconds) => T,
): T {
  if (range.from) {
    const b: BoundsInMilliseconds = {
      from: range.from,
    };
    if (range.to) {
      b.to = range.to;
    }
    return ifBounded(b);
  }
  if (range.rangeDuration) {
    return ifDuration(range.rangeDuration);
  }
  // It shouldn't reach here a TimeRange should have DurationInSeconds or BoundsInMilliseconds
  return ifDuration(defaultMetricsDuration);
}

export const evalTimeRange = (range: TimeRange): [Date, Date] => {
  const bounds = guardTimeRange(range, durationToBounds, b => b);
  return [
    bounds.from ? new Date(bounds.from) : new Date(),
    bounds.to ? new Date(bounds.to) : new Date(),
  ];
};

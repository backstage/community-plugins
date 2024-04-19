/*
 * Copyright 2021 The Backstage Authors
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
import { BuildStatus } from '../api';
import upperFirst from 'lodash/upperFirst';

export const formatDuration = (seconds: number) => {
  const duration = Duration.fromObject({
    seconds: seconds,
  }).shiftTo('hours', 'minutes', 'seconds', 'milliseconds');

  if (duration.hours + duration.minutes + duration.seconds === 0) {
    return `${Math.round(duration.milliseconds)} ms`;
  }

  const h = duration.hours ? `${duration.hours} h` : '';
  const m = duration.minutes ? `${duration.minutes} m` : '';
  const s = duration.hours < 12 ? `${duration.seconds ?? 0} s` : '';

  return `${h} ${m} ${s}`;
};

export const formatSecondsInterval = ([start, end]: [number, number]) => {
  return `${Math.round(start * 100) / 100} s - ${
    Math.round(end * 100) / 100
  } s`;
};

export const formatTime = (timestamp: string) => {
  return DateTime.fromISO(timestamp).toLocaleString(
    DateTime.DATETIME_SHORT_WITH_SECONDS,
  );
};

export const formatPercentage = (number: number) => {
  return `${Math.round(number * 100)} %`;
};

export const formatStatus = (status: BuildStatus) => upperFirst(status);

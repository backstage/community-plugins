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
export const maxClockSkewMS = -60000;

export const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  year: 'numeric',
});

export const relativeTimeFormatter = Intl.RelativeTimeFormat
  ? new Intl.RelativeTimeFormat(undefined)
  : null;

export const getDuration = (milsec: number | null) => {
  let ms = milsec;
  if (!ms || ms < 0) {
    ms = 0;
  }
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  const days = Math.floor(hours / 24);
  hours = hours % 24;
  return { days, hours, minutes, seconds };
};

export const fromNow = (
  dateTime: string | Date | null,
  nowt?: Date,
  options?: any,
) => {
  // Check for null. If dateTime is null, it returns incorrect date Jan 1 1970.
  if (!dateTime) {
    return '-';
  }

  let now = nowt;

  if (!now) {
    now = new Date();
  }

  const d = new Date(dateTime);
  const ms = now.getTime() - d.getTime();
  const justNow = 'Just now';

  // If the event occurred less than one minute in the future, assume it's clock drift and show "Just now."
  if (!options?.omitSuffix && ms < 60000 && ms > maxClockSkewMS) {
    return justNow;
  }

  // Do not attempt to handle other dates in the future.
  if (ms < 0) {
    return '-';
  }

  const { days, hours, minutes } = getDuration(ms);

  if (options?.omitSuffix) {
    if (days) {
      return `${days} day`;
    }
    if (hours) {
      return `${hours} hour`;
    }
    return `${minutes} minute`;
  }

  // Fallback to normal date/time formatting if Intl.RelativeTimeFormat is not
  // available. This is the case for older Safari versions.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat#browser_compatibility
  if (!relativeTimeFormatter) {
    return dateTimeFormatter.format(d);
  }

  if (!days && !hours && !minutes) {
    return justNow;
  }

  if (days) {
    return relativeTimeFormatter.format(-days, 'day');
  }

  if (hours) {
    return relativeTimeFormatter.format(-hours, 'hour');
  }

  return relativeTimeFormatter.format(-minutes, 'minute');
};

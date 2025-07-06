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

/**
 * Formats the announcement start time.
 *
 * @param startAt - The ISO 8601 formatted start time of the announcement.
 * @param occurred - The localized string indicating the announcement occurred.
 * @param scheduled - The localized string indicating the announcement is scheduled.
 * @param today - The localized string for when the announcement is happening today.
 * @returns - A formatted start at string.
 */
export const formatAnnouncementStartTime = (
  startAt: string,
  occurred: string,
  scheduled: string,
  today: string,
): string => {
  const startDate = DateTime.fromISO(startAt);
  const now = DateTime.now();

  if (startDate.hasSame(now, 'day')) {
    return `${scheduled} ${today}`;
  }

  return startDate < now
    ? `${occurred} ${startDate.toRelative()}`
    : `${scheduled} ${startDate.toRelative()}`;
};

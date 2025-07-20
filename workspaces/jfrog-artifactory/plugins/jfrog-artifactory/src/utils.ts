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

import { filesize } from 'filesize';
import { DateTime } from 'luxon';

export function formatByteSize(sizeInBytes: number | undefined): string {
  if (!sizeInBytes) return 'N/A';

  return filesize(sizeInBytes);
}

/**
 * Formats a date using the Backstage-standard Luxon library.
 *
 * @param date - The date to format, can be a string, number (Unix timestamp), or Date object.
 * @returns A formatted date string (e.g., "Jun 9, 2025, 6:15 PM") or 'N/A'.
 */
export function formatDate(date: string | number | Date | undefined): string {
  if (!date || date === -1) {
    return 'N/A';
  }

  let dt: DateTime;

  if (typeof date === 'number') {
    dt = DateTime.fromSeconds(date);
  } else if (date instanceof Date) {
    dt = DateTime.fromJSDate(date);
  } else {
    dt = DateTime.fromISO(date);
  }

  if (!dt.isValid) {
    return 'N/A';
  }
  return dt.toLocaleString(DateTime.DATETIME_MED);
}

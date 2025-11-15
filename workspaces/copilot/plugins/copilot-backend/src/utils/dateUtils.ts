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
 * Normalizes date values.
 */
export function formatDate(value: string | Date | undefined): string {
  if (value === null || value === undefined) {
    return 'date not available';
  }

  const dateTime =
    value instanceof Date
      ? DateTime.fromJSDate(value).toUTC()
      : DateTime.fromJSDate(new Date(value)).toUTC();

  if (!dateTime.isValid) {
    return value instanceof Date ? value.toString() : String(value);
  }

  return dateTime.toISO();
}

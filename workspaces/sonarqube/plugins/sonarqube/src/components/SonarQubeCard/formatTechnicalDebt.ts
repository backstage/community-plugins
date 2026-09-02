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

// SonarQube reports `sqale_index` in minutes and renders it as a work duration
// using a working day of `sonar.technicalDebt.hoursInDay`, which defaults to 8.
const HOURS_IN_DAY = 8;
const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;

/**
 * Format the `sqale_index` measure the way SonarQube does, so the value shown
 * in Backstage matches the value shown on the SonarQube project page.
 *
 * Only the two most significant units are kept: `3d 4h`, `4h 30min`, `12min`.
 *
 * @internal
 */
export function formatTechnicalDebt(sqaleIndex?: string): string | undefined {
  if (!sqaleIndex) {
    return undefined;
  }

  const totalMinutes = Number(sqaleIndex);
  if (!Number.isFinite(totalMinutes)) {
    return undefined;
  }

  const isNegative = totalMinutes < 0;
  const absoluteMinutes = Math.abs(totalMinutes);

  const days = Math.floor(absoluteMinutes / MINUTES_IN_DAY);
  const hours = Math.floor(
    (absoluteMinutes % MINUTES_IN_DAY) / MINUTES_IN_HOUR,
  );
  const minutes = absoluteMinutes % MINUTES_IN_HOUR;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0 && days < 10) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 && days === 0) {
    parts.push(`${minutes}min`);
  }

  if (parts.length === 0) {
    return '0';
  }

  return `${isNegative ? '-' : ''}${parts.join(' ')}`;
}

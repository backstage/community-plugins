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
export const formatRelativeTime = (date: Date | string): string => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) {
    return 'just now';
  }
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr} hr ago`;
  }

  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
};

export const formatRelativeShort = (date: Date | string): string => {
  const diffMin = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (diffMin < 60) {
    return `${Math.max(diffMin, 1)}m`;
  }
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h`;
  }
  return `${Math.round(diffHr / 24)}d`;
};

export const formatClockTime = (date: Date | string): string =>
  new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatDateTime = (date: Date | string): string =>
  new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatDuration = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

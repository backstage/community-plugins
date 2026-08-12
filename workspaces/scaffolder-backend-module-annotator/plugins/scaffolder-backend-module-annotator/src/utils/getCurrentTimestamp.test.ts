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
import { getCurrentTimestamp } from './getCurrentTimestamp';

describe('getCurrentTimestamp', () => {
  it('formats an explicit date using locale date and en-US time', () => {
    const date = new Date('2024-06-15T14:30:00.000Z');

    expect(getCurrentTimestamp(date)).toBe(
      `${date.toLocaleDateString()}, ${date.toLocaleTimeString('en-US')}`,
    );
  });

  it('returns a non-empty string when no date is provided', () => {
    const timestamp = getCurrentTimestamp();

    expect(typeof timestamp).toBe('string');
    expect(timestamp.length).toBeGreaterThan(0);
  });
});

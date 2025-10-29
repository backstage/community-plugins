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

import { convertDateFormat } from './stringUtils';

describe('convertDateFormat', () => {
  it('converts a valid date string with time', () => {
    const input = '2024-05-01 12:00:00';
    const result = convertDateFormat(input);
    // Example result: "May 1, 2024"
    expect(result).toMatch(/May\s+1,\s+2024/);
  });

  it('converts a valid date string without time', () => {
    const input = '2024-05-01';
    const result = convertDateFormat(input);
    expect(result).toMatch(/May\s+1,\s+2024/);
  });

  it('returns empty string for empty input', () => {
    const result = convertDateFormat('');
    expect(result).toBe('');
  });

  it('returns empty string for invalid date', () => {
    const result = convertDateFormat('invalid-date');
    expect(result).toBe('');
  });
});

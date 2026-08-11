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
import { formatTechnicalDebt } from './formatTechnicalDebt';

describe('formatTechnicalDebt', () => {
  it.each([
    ['12', '12min'],
    ['60', '1h'],
    ['270', '4h 30min'],
    ['480', '1d'],
    ['2640', '5d 4h'],
    ['-2640', '-5d 4h'],
    ['0', '0'],
  ])('should format %s minutes as %s', (sqaleIndex, expected) => {
    expect(formatTechnicalDebt(sqaleIndex)).toBe(expected);
  });

  it('should keep only the most significant units', () => {
    // days drop the minutes, and ten days or more drop the hours as well
    expect(formatTechnicalDebt('662')).toBe('1d 3h');
    expect(formatTechnicalDebt('3602')).toBe('7d 4h');
    expect(formatTechnicalDebt('5000')).toBe('10d');
  });

  it.each([undefined, '', 'not-a-number'])(
    'should return undefined for %o',
    sqaleIndex => {
      expect(formatTechnicalDebt(sqaleIndex)).toBeUndefined();
    },
  );
});

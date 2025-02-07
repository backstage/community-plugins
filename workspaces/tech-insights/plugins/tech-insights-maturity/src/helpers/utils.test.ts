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
import { Rank } from '@backstage-community/plugin-tech-insights-maturity-common';
import { getNextRankColor, pluralize } from './utils';

describe('Utility functions', () => {
  describe('getRankColor()', () => {
    it('should return a string for the correct corresponding colors', () => {
      expect(getNextRankColor(Rank.Stone, Rank.Gold)).toBe('#704A07');
      expect(getNextRankColor(Rank.Silver, Rank.Gold)).toBe('#DEB82D');
      expect(getNextRankColor(Rank.Gold, Rank.Gold)).toBe('limegreen');
    });
  });

  describe('pluralize()', () => {
    it('should return a blank string if the input is 1', () => {
      expect(pluralize(1)).toBe('');
    });
    it('should return an "s" if the input is more than 1', () => {
      expect(pluralize(2)).toBe('s');
    });
  });
});

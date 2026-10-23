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
import { analyzeVotes, type VoteEntry } from './consensus';

const deck = ['0', '1', '2', '3', '5', '8', '13', '?'];
const vote = (userId: string, value: string): VoteEntry => ({
  userId,
  userName: userId,
  value,
});

describe('analyzeVotes', () => {
  it('recognizes unanimous estimates', () => {
    const result = analyzeVotes([vote('maya', '5'), vote('liam', '5')], deck);

    expect(result).toMatchObject({
      average: '5.0',
      median: '5',
      mode: '5',
      spread: { high: '5', low: '5' },
      status: 'unanimous',
      total: 2,
    });
  });

  it('highlights a spread that needs discussion', () => {
    const result = analyzeVotes(
      [vote('maya', '3'), vote('liam', '5'), vote('sofia', '8')],
      deck,
    );

    expect(result).toMatchObject({
      average: '5.3',
      highOutlier: { userId: 'sofia', value: '8' },
      lowOutlier: { userId: 'maya', value: '3' },
      median: '5',
      spread: { high: '8', low: '3' },
      status: 'discuss',
    });
  });

  it('keeps question-mark votes out of numeric calculations', () => {
    const result = analyzeVotes([vote('maya', '5'), vote('liam', '?')], deck);

    expect(result.average).toBe('5.0');
    expect(result.distribution.map(bucket => bucket.value)).toEqual(['5', '?']);
    expect(result.status).toBe('discuss');
  });
});

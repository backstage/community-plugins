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
import { buildVoteEntries } from './buildVotes';

const participants = [
  {
    avatarSeed: 'maya-seed',
    avatarStyle: 'adventurer',
    userId: 'maya',
    userName: 'Maya Chen',
  },
  { userId: 'guest', userName: 'Guest User' },
];

describe('buildVoteEntries', () => {
  it('enriches persisted votes with participant avatars', () => {
    expect(
      buildVoteEntries(
        [{ userId: 'maya', userName: 'Maya', value: '8' }],
        participants,
        'guest',
        null,
      ),
    ).toEqual([
      {
        avatarSeed: 'maya-seed',
        avatarStyle: 'adventurer',
        userId: 'maya',
        userName: 'Maya Chen',
        value: '8',
      },
    ]);
  });

  it('shows the current local vote once while polling catches up', () => {
    const result = buildVoteEntries([], participants, 'guest', '5');

    expect(result).toEqual([
      {
        avatarSeed: undefined,
        avatarStyle: undefined,
        userId: 'guest',
        userName: 'Guest User',
        value: '5',
      },
    ]);
  });

  it('does not duplicate a current-user vote returned by the backend', () => {
    const result = buildVoteEntries(
      [{ userId: 'guest', userName: 'Guest User', value: '5' }],
      participants,
      'guest',
      '5',
    );

    expect(result).toHaveLength(1);
  });
});

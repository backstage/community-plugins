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
import type { VoteEntry } from './consensus';

type Avatared = Readonly<{
  avatarSeed?: string;
  avatarStyle?: string;
  userId: string;
  userName: string;
}>;

type StoryVote = Readonly<{
  userId: string;
  userName: string;
  value: string;
}>;

export const buildVoteEntries = (
  storyVotes: ReadonlyArray<StoryVote>,
  participants: ReadonlyArray<Avatared>,
  currentUserId: string,
  myValue: null | string,
): VoteEntry[] => {
  const findParticipant = (id: string) =>
    participants.find(p => p.userId === id);

  const realVotes: VoteEntry[] = storyVotes.map(v => {
    const participant = findParticipant(v.userId);
    return {
      avatarSeed: participant?.avatarSeed,
      avatarStyle: participant?.avatarStyle,
      userId: v.userId,
      userName: participant?.userName ?? v.userName,
      value: v.value,
    };
  });

  const me = findParticipant(currentUserId);
  const myEntry: VoteEntry[] =
    myValue && me && !realVotes.some(v => v.userId === currentUserId)
      ? [
          {
            avatarSeed: me.avatarSeed,
            avatarStyle: me.avatarStyle,
            userId: currentUserId,
            userName: me.userName,
            value: myValue,
          },
        ]
      : [];

  return [...realVotes, ...myEntry];
};

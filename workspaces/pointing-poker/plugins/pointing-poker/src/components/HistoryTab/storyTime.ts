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
import type {
  Session,
  Story,
} from '@backstage-community/plugin-pointing-poker-common';

// Effective estimation time for a story. Only the active story of an ongoing
// session adds live time; once completed, a leftover active story stays frozen
// to its accumulated duration so an unended session can't tick forever.
export const storyElapsedSeconds = (
  story: Story,
  sessionCompleted: boolean,
  now: number = Date.now(),
): number => {
  if (story.state === 'active' && !sessionCompleted && story.startedAt) {
    const live = Math.max(
      0,
      Math.floor((now - new Date(story.startedAt).getTime()) / 1000),
    );
    return story.durationSeconds + live;
  }
  return story.durationSeconds;
};

// Session total: time from the first story through the last estimated or skipped
// one, so trailing in-progress/pending stories don't count toward the session.
export const sessionElapsedSeconds = (
  session: Session,
  now: number = Date.now(),
): number => {
  const completed = session.status === 'completed';
  const lastFinalized = session.stories.reduce(
    (last, story, index) =>
      story.state === 'estimated' || story.state === 'skipped' ? index : last,
    -1,
  );
  const counted = completed
    ? session.stories.slice(0, lastFinalized + 1)
    : session.stories;
  return counted.reduce(
    (total, story) => total + storyElapsedSeconds(story, completed, now),
    0,
  );
};

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
import { CSSProperties, Fragment } from 'react';
import { Box, Focusable, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import type {
  Participant,
  Session,
  Story,
  StoryState,
} from '@backstage-community/plugin-pointing-poker-common';
import { CharacterAvatar } from '../LiveSessionTab/CharacterAvatar';
import { formatDuration } from '../LiveSessionTab/utils/relativeTime';
import { storyElapsedSeconds } from './storyTime';

type StateStyle = Readonly<{
  bg: string;
  fg: string;
  label: string;
}>;

type StoryMatrixProps = Readonly<{
  session: Session;
}>;

// Mirrors the SessionProgress queue palette so a story reads the same in both
// the live view and history.
const STATE_STYLE: Record<StoryState, StateStyle> = {
  active: { bg: '#dbeafe', fg: '#1d4ed8', label: 'in progress' },
  estimated: { bg: '#ccfbf1', fg: '#0f766e', label: 'estimated' },
  pending: {
    bg: 'var(--bui-bg-neutral-2)',
    fg: 'var(--bui-fg-secondary)',
    label: 'pending',
  },
  skipped: { bg: '#ffe4e6', fg: '#be123c', label: 'skipped' },
  snoozed: { bg: '#fef3c7', fg: '#b45309', label: 'snoozed' },
  split: { bg: '#ede9fe', fg: '#6d28d9', label: 'split' },
};

const firstName = (name: string): string => name.split(' ')[0] || name;

const StateBadge = ({ state }: Readonly<{ state: StoryState }>) => {
  const style = STATE_STYLE[state];
  return (
    <span
      style={{
        background: style.bg,
        borderRadius: 'var(--bui-radius-full)',
        color: style.fg,
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '2px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {style.label}
    </span>
  );
};

const StoryCell = ({ story }: Readonly<{ story: Story }>) => (
  <Box style={{ minWidth: 0 }}>
    {story.ticketKey && (
      <Text
        as="div"
        color="secondary"
        style={{ fontFamily: 'var(--bui-font-monospace)' }}
        variant="body-x-small"
      >
        {story.ticketKey}
      </Text>
    )}
    <Text as="p" title={story.title} truncate variant="body-small">
      {story.title}
    </Text>
  </Box>
);

// The Story column is left auto-width so it soaks up all the slack; the last
// four column types stay tight and fixed so they line up across every card.
const STORY_MIN = 240;
const STATE_W = 92;
const TIME_W = 60;
const EST_W = 48;
const PERSON_W = 56;

const columnHeadStyle: CSSProperties = {
  alignItems: 'center',
  color: 'var(--bui-fg-secondary)',
  display: 'flex',
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const bodyCellStyle = (isLast: boolean): CSSProperties => ({
  alignItems: 'center',
  borderBottom: isLast ? 'none' : '1px solid var(--bui-border-1)',
  display: 'flex',
  minWidth: 0,
  padding: '8px',
});

export const StoryMatrix = ({ session }: StoryMatrixProps) => {
  const participants = session.participants as ReadonlyArray<Participant>;
  const completed = session.status === 'completed';
  const minWidth =
    STORY_MIN + STATE_W + TIME_W + EST_W + participants.length * PERSON_W;
  const columns = `minmax(${STORY_MIN}px, 1fr) ${STATE_W}px ${TIME_W}px ${EST_W}px repeat(${participants.length}, ${PERSON_W}px)`;
  const headBorder = '1px solid var(--bui-border-1)';

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: columns,
          minWidth: `${minWidth}px`,
        }}
      >
        <div
          style={{
            ...columnHeadStyle,
            borderBottom: headBorder,
            padding: '8px 12px 8px 0',
          }}
        >
          Story
        </div>
        <div
          style={{
            ...columnHeadStyle,
            borderBottom: headBorder,
            padding: '8px',
          }}
        >
          State
        </div>
        <div
          style={{
            ...columnHeadStyle,
            borderBottom: headBorder,
            padding: '8px',
          }}
        >
          Time
        </div>
        <div
          style={{
            ...columnHeadStyle,
            borderBottom: headBorder,
            padding: '8px',
          }}
        >
          Est
        </div>
        {participants.map(person => (
          <div
            key={person.userId}
            style={{
              alignItems: 'center',
              borderBottom: headBorder,
              display: 'flex',
              justifyContent: 'center',
              padding: '8px 4px',
            }}
          >
            <TooltipTrigger>
              <Focusable>
                <span
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <CharacterAvatar
                    name={person.userName}
                    seed={person.avatarSeed}
                    size={28}
                    style={person.avatarStyle}
                  />
                  <Text
                    style={{ maxWidth: '4rem' }}
                    truncate
                    variant="body-x-small"
                  >
                    {firstName(person.userName)}
                  </Text>
                </span>
              </Focusable>
              <Tooltip>{person.userName}</Tooltip>
            </TooltipTrigger>
          </div>
        ))}

        {session.stories.map((story, index) => {
          const byUser = new Map(story.votes.map(v => [v.userId, v.value]));
          const elapsed = storyElapsedSeconds(story, completed);
          const displayState =
            completed && story.state === 'active' ? 'pending' : story.state;
          const isLast = index === session.stories.length - 1;
          return (
            <Fragment key={story.id}>
              <div
                style={{ ...bodyCellStyle(isLast), padding: '8px 12px 8px 0' }}
              >
                <StoryCell story={story} />
              </div>
              <div style={bodyCellStyle(isLast)}>
                <StateBadge state={displayState} />
              </div>
              <div
                style={{
                  ...bodyCellStyle(isLast),
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <Text
                  color="secondary"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                  variant="body-small"
                >
                  {elapsed > 0 ? formatDuration(elapsed) : '—'}
                </Text>
              </div>
              <div style={bodyCellStyle(isLast)}>
                <Text variant="body-small" weight="bold">
                  {story.estimate ?? '—'}
                </Text>
              </div>
              {participants.map(person => (
                <div
                  key={person.userId}
                  style={{
                    ...bodyCellStyle(isLast),
                    fontVariantNumeric: 'tabular-nums',
                    justifyContent: 'center',
                  }}
                >
                  {byUser.get(person.userId) ? (
                    <Text
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                      variant="body-small"
                    >
                      {byUser.get(person.userId)}
                    </Text>
                  ) : (
                    <Text color="secondary" variant="body-small">
                      -
                    </Text>
                  )}
                </div>
              ))}
            </Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

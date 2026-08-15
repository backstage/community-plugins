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
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Box, Button, Card, CardBody, Flex, Text } from '@backstage/ui';
import type { Session } from '@backstage-community/plugin-pointing-poker-common';
import { CharacterAvatar } from '../LiveSessionTab/CharacterAvatar';
import { SessionComplete } from '../LiveSessionTab/SessionComplete';
import {
  formatClockTime,
  formatDuration,
  formatRelativeTime,
} from '../LiveSessionTab/utils/relativeTime';
import { teamColor } from '../LiveSessionTab/utils/teamColor';
import { sessionElapsedSeconds } from './storyTime';
import { StoryMatrix } from './StoryMatrix';

type CardView = 'breakdown' | 'summary';

type HistorySessionCardProps = Readonly<{
  session: Session;
  teamName: string;
}>;

const MAX_STACK = 6;

const StatusPill = ({ completed }: Readonly<{ completed: boolean }>) => (
  <span
    style={{
      background: completed
        ? 'var(--bui-bg-neutral-2)'
        : 'var(--bui-bg-success)',
      borderRadius: 'var(--bui-radius-full)',
      color: completed
        ? 'var(--bui-fg-secondary)'
        : 'var(--bui-fg-success-on-bg)',
      fontSize: '0.75rem',
      fontWeight: 500,
      padding: '2px 8px',
      whiteSpace: 'nowrap',
    }}
  >
    {completed ? 'Completed' : 'Ongoing'}
  </span>
);

export const HistorySessionCard = ({
  session,
  teamName,
}: HistorySessionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<CardView>('summary');
  const color = teamColor(session.teamRef ?? '');

  const estimated = session.stories.filter(s => s.state === 'estimated').length;
  const total = session.stories.length;
  const totalSeconds = sessionElapsedSeconds(session);
  const stack = session.participants.slice(0, MAX_STACK);
  const overflow = session.participants.length - stack.length;

  return (
    <Card
      style={{ borderLeft: `4px solid ${color.border}`, overflow: 'hidden' }}
    >
      <CardBody style={{ padding: 0 }}>
        <button
          aria-expanded={expanded}
          onClick={() => setExpanded(prev => !prev)}
          style={{
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            gap: 'var(--bui-space-3)',
            padding: 'var(--bui-space-4)',
            textAlign: 'left',
            width: '100%',
          }}
          type="button"
        >
          {expanded ? (
            <ChevronDown
              size={16}
              style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
            />
          ) : (
            <ChevronRight
              size={16}
              style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
            />
          )}

          <Box style={{ flex: '1 1 0%', minWidth: 0 }}>
            <Flex align="center" gap="2" style={{ flexWrap: 'wrap' }}>
              <span
                style={{
                  background: color.chipBg,
                  borderRadius: 'var(--bui-radius-full)',
                  color: color.chipText,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {teamName}
              </span>
              <Text
                style={{ minWidth: 0 }}
                truncate
                variant="body-medium"
                weight="bold"
              >
                {session.name}
              </Text>
              <StatusPill completed={session.status === 'completed'} />
            </Flex>
            <Text
              as="p"
              color="secondary"
              style={{ marginTop: 'var(--bui-space-1)' }}
              variant="body-x-small"
            >
              {`Started by ${session.createdByName} · ${formatClockTime(
                session.createdAt,
              )} (${formatRelativeTime(session.createdAt)})`}
            </Text>
          </Box>

          <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
            <Text color="secondary" variant="body-x-small">
              {`${estimated}/${total} estimated`}
              {totalSeconds > 0
                ? ` · ${formatDuration(totalSeconds)} total`
                : ''}
            </Text>
            <Box style={{ display: 'flex' }}>
              {stack.map((person, i) => (
                <Box
                  key={person.userId}
                  style={{
                    borderRadius: 'var(--bui-radius-full)',
                    boxShadow: '0 0 0 2px var(--bui-bg-neutral-1)',
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                >
                  <CharacterAvatar
                    name={person.userName}
                    seed={person.avatarSeed}
                    size={28}
                    style={person.avatarStyle}
                  />
                </Box>
              ))}
              {overflow > 0 && (
                <span
                  style={{
                    alignItems: 'center',
                    background: 'var(--bui-bg-neutral-2)',
                    borderRadius: 'var(--bui-radius-full)',
                    boxShadow: '0 0 0 2px var(--bui-bg-neutral-1)',
                    color: 'var(--bui-fg-secondary)',
                    display: 'flex',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    height: 28,
                    justifyContent: 'center',
                    marginLeft: -8,
                    width: 28,
                  }}
                >
                  {`+${overflow}`}
                </span>
              )}
            </Box>
          </Flex>
        </button>

        {expanded && (
          <Flex
            direction="column"
            gap="4"
            style={{
              borderTop: '1px solid var(--bui-border-1)',
              padding: 'var(--bui-space-4)',
            }}
          >
            {total === 0 && (
              <Text as="p" color="secondary" variant="body-small">
                No stories were added to this session.
              </Text>
            )}
            {total > 0 && (
              <>
                <Flex
                  align="center"
                  gap="1"
                  style={{
                    alignSelf: 'flex-start',
                    border: '1px solid var(--bui-border-1)',
                    borderRadius: 'var(--bui-radius-3)',
                    padding: '2px',
                  }}
                >
                  <Button
                    onClick={() => setView('summary')}
                    size="small"
                    variant={view === 'summary' ? 'secondary' : 'tertiary'}
                  >
                    Summary
                  </Button>
                  <Button
                    onClick={() => setView('breakdown')}
                    size="small"
                    variant={view === 'breakdown' ? 'secondary' : 'tertiary'}
                  >
                    Breakdown
                  </Button>
                </Flex>

                {view === 'summary' ? (
                  <SessionComplete embedded session={session} />
                ) : (
                  <StoryMatrix session={session} />
                )}
              </>
            )}
          </Flex>
        )}
      </CardBody>
    </Card>
  );
};

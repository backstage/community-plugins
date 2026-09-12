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
import { Check, Clock3, Flag, MoonStar } from 'lucide-react';
import { Box, Flex, Text } from '@backstage/ui';
import type {
  Session,
  Story,
} from '@backstage-community/plugin-pointing-poker-common';

type SessionCompleteProps = Readonly<{
  embedded?: boolean;
  session: Session;
}>;

type FollowUpRowProps = Readonly<{
  story: Story;
}>;

const FollowUpRow = ({ story }: FollowUpRowProps) => {
  const snoozed = story.state === 'snoozed';
  const Icon = snoozed ? MoonStar : Flag;

  return (
    <Flex
      align="center"
      gap="3"
      style={{
        borderBottom: '1px solid var(--bui-border-1)',
        padding: '10px 0',
      }}
    >
      <Text
        as="span"
        variant="body-small"
        truncate
        style={{ flex: 1, minWidth: 0 }}
      >
        {story.ticketKey && (
          <Text
            as="span"
            variant="body-small"
            color="secondary"
            style={{ fontFamily: 'var(--bui-font-monospace)' }}
          >
            {`${story.ticketKey} · `}
          </Text>
        )}
        <Text as="span" variant="body-small" weight="bold">
          {story.title}
        </Text>
      </Text>

      <Flex
        align="center"
        gap="1"
        style={{
          background: snoozed
            ? 'var(--bui-bg-warning)'
            : 'var(--bui-bg-danger)',
          borderRadius: 'var(--bui-radius-full)',
          color: snoozed ? 'var(--bui-fg-warning)' : 'var(--bui-fg-danger)',
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 500,
          padding: '2px 8px',
        }}
      >
        <Icon size={12} />
        {snoozed ? 'Snoozed — never returned' : 'Skipped — not ready'}
      </Flex>
    </Flex>
  );
};

export const SessionComplete = ({
  embedded = false,
  session,
}: SessionCompleteProps) => {
  const estimated = session.stories.filter(s => s.state === 'estimated');
  const followUps = session.stories.filter(
    s => s.state === 'skipped' || s.state === 'snoozed',
  );

  const untouched = session.stories.filter(
    s => s.state === 'active' || s.state === 'pending',
  );

  const total = session.stories.length;
  const ongoing = session.status !== 'completed';
  const endedEarly = untouched.length > 0;
  const clean = followUps.length === 0;

  let heading = 'All stories refined!';
  if (ongoing) {
    heading = 'Session in progress';
  } else if (endedEarly) {
    heading = 'Session ended';
  } else if (!clean) {
    heading = 'Refinement complete';
  }

  let savedLine = `All ${estimated.length} estimated and saved to Jira`;
  if (ongoing) {
    savedLine = `${estimated.length} of ${total} estimated so far`;
  } else if (endedEarly) {
    savedLine = `${estimated.length} of ${total} estimated and saved to Jira`;
  } else if (!clean) {
    savedLine = `${estimated.length} of ${total} estimated and saved to Jira · ${followUps.length} need follow-up`;
  }

  let StatusIcon = Check;
  if (ongoing) {
    StatusIcon = Clock3;
  } else if (endedEarly) {
    StatusIcon = Flag;
  }

  const body = (
    <Flex
      direction="column"
      gap={embedded ? '4' : '6'}
      style={
        embedded
          ? undefined
          : {
              background: 'var(--bui-bg-neutral-1)',
              border: '1px solid var(--bui-border-1)',
              borderRadius: 'var(--bui-radius-4)',
              margin: '0 auto',
              maxWidth: '42rem',
              padding: 'var(--bui-space-8)',
            }
      }
    >
      <Flex
        direction={embedded ? 'row' : 'column'}
        align="center"
        gap="3"
        style={{ textAlign: embedded ? 'left' : 'center' }}
      >
        <Box
          style={{
            alignItems: 'center',
            background:
              ongoing || endedEarly
                ? 'var(--bui-bg-neutral-2)'
                : 'var(--bui-bg-success)',
            borderRadius: 'var(--bui-radius-full)',
            display: 'flex',
            flexShrink: 0,
            height: embedded ? 48 : 64,
            justifyContent: 'center',
            width: embedded ? 48 : 64,
          }}
        >
          <StatusIcon
            size={embedded ? 24 : 32}
            style={{
              color:
                ongoing || endedEarly
                  ? 'var(--bui-fg-secondary)'
                  : 'var(--bui-fg-success)',
            }}
          />
        </Box>

        <Box>
          <Text as="h2" variant="title-medium" weight="bold">
            {heading}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {savedLine}
          </Text>
        </Box>
      </Flex>

      {followUps.length > 0 && (
        <Box style={{ textAlign: 'left' }}>
          <Flex align="center" gap="2">
            <Text
              as="span"
              variant="body-x-small"
              weight="bold"
              color="secondary"
              style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
            >
              Needs follow-up
            </Text>
            <Box
              style={{
                background: 'var(--bui-bg-danger)',
                borderRadius: 'var(--bui-radius-full)',
                color: 'var(--bui-fg-danger)',
                fontSize: 12,
                padding: '2px 8px',
              }}
            >
              {followUps.length}
            </Box>
          </Flex>
          <Box style={{ marginTop: 8 }}>
            {followUps.map(story => (
              <FollowUpRow key={story.id} story={story} />
            ))}
          </Box>
        </Box>
      )}
    </Flex>
  );

  if (embedded) {
    return body;
  }
  return <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{body}</Box>;
};

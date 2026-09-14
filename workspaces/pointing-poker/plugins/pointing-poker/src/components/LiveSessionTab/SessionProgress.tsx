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
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Filter,
  ListChecks,
  Lock,
  Undo2,
} from 'lucide-react';
import { Box, Flex, Text } from '@backstage/ui';
import type { StoryState } from '@backstage-community/plugin-pointing-poker-common';
import { useSessionApi } from './hooks/useSessionApi';
import { formatDuration } from './utils/relativeTime';
import { useElapsedSeconds } from './hooks/useElapsed';

const TIMEBOX_SECONDS = 5 * 60;

type QueueStory = Readonly<{
  estimate?: string;
  id: string;
  parentStoryId?: string;
  startedAt?: Date | string;
  state: StoryState;
  ticketKey?: string;
  title: string;
}>;

type SessionProgressProps = Readonly<{
  currentStoryId?: string;
  onActivateStory?: (storyId: string) => void;
  stories: ReadonlyArray<QueueStory>;
  teamName?: string;
  teamRef?: string;
}>;

const ACTIONABLE_STATES: ReadonlySet<StoryState> = new Set([
  'pending',
  'skipped',
  'snoozed',
]);

type StateStyle = Readonly<{
  dot: string;
  dotBorder?: boolean;
  label: string;
  tag: string;
}>;

const STATE_STYLE: Record<StoryState, StateStyle> = {
  active: {
    dot: 'var(--bui-fg-info)',
    label: 'now',
    tag: 'var(--bui-fg-info)',
  },
  estimated: {
    dot: 'var(--bui-fg-success)',
    label: 'done',
    tag: 'var(--bui-fg-success)',
  },
  pending: {
    dot: 'transparent',
    dotBorder: true,
    label: 'pending',
    tag: 'var(--bui-fg-secondary)',
  },
  skipped: {
    dot: 'var(--bui-fg-danger)',
    label: 'skipped',
    tag: 'var(--bui-fg-danger)',
  },
  snoozed: {
    dot: 'var(--bui-fg-warning)',
    label: 'snoozed',
    tag: 'var(--bui-fg-warning)',
  },
  split: {
    dot: 'var(--bui-fg-info)',
    label: 'split · rolls up',
    tag: 'var(--bui-fg-info)',
  },
};

type InlinePopoverProps = Readonly<{
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
}>;

const InlinePopover = ({
  children,
  isOpen,
  onOpenChange,
  trigger,
}: InlinePopoverProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onDocMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <Box ref={ref} style={{ display: 'inline-flex', position: 'relative' }}>
      {trigger}
      {isOpen && (
        <Box
          style={{
            background: 'var(--bui-bg-neutral-1)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            marginTop: 4,
            maxHeight: '34rem',
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '24rem',
            zIndex: 50,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

type QueueRowProps = Readonly<{
  currentStoryId?: string;
  onActivateStory?: (storyId: string) => void;
  story: QueueStory;
}>;

const QueueRow = ({
  currentStoryId,
  onActivateStory,
  story,
}: QueueRowProps) => {
  const [hovered, setHovered] = useState(false);
  const style = STATE_STYLE[story.state];
  const isActionable =
    Boolean(onActivateStory) && ACTIONABLE_STATES.has(story.state);
  const isCurrent = story.id === currentStoryId;

  const rowStyle = {
    alignItems: 'center',
    background:
      isCurrent || (isActionable && hovered)
        ? 'var(--bui-bg-neutral-2)'
        : 'transparent',
    border: 'none',
    borderRadius: 'var(--bui-radius-2)',
    cursor: isActionable ? 'pointer' : 'default',
    display: 'flex',
    font: 'inherit',
    gap: 8,
    padding: 8,
    textAlign: 'left' as const,
    width: '100%',
  };

  const content = (
    <>
      <span
        style={{
          background: style.dot,
          border: style.dotBorder
            ? '1px solid var(--bui-fg-secondary)'
            : undefined,
          borderRadius: 'var(--bui-radius-full)',
          flexShrink: 0,
          height: 8,
          width: 8,
        }}
      />
      <Text
        as="span"
        variant="body-small"
        truncate
        color={story.state === 'skipped' ? 'secondary' : undefined}
        style={{ flex: 1, minWidth: 0 }}
        title={story.title}
      >
        {story.ticketKey && (
          <Text
            as="span"
            variant="body-x-small"
            color="secondary"
            style={{ fontFamily: 'var(--bui-font-monospace)' }}
          >
            {`${story.ticketKey} `}
          </Text>
        )}
        {story.title}
      </Text>
      {(() => {
        if (story.state === 'estimated' && story.estimate) {
          return (
            <Flex
              align="center"
              gap="1"
              style={{ color: style.tag, fontSize: 12 }}
            >
              <Check size={14} />
              {story.estimate}
            </Flex>
          );
        }
        if (story.state === 'skipped' && isActionable && hovered) {
          return (
            <Flex
              align="center"
              gap="1"
              style={{
                background: 'var(--bui-bg-danger)',
                border: '1px solid var(--bui-border-1)',
                borderRadius: 'var(--bui-radius-full)',
                color: 'var(--bui-fg-danger)',
                fontSize: 12,
                fontWeight: 500,
                padding: '2px 8px',
              }}
            >
              <Undo2 size={12} />
              Re-open
            </Flex>
          );
        }
        return (
          <Text as="span" variant="body-x-small" style={{ color: style.tag }}>
            {style.label}
          </Text>
        );
      })()}
    </>
  );

  if (isActionable) {
    return (
      <button
        onClick={() => onActivateStory?.(story.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={rowStyle}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <Box style={rowStyle}>{content}</Box>;
};

export const SessionProgress = ({
  currentStoryId,
  onActivateStory,
  stories,
  teamName,
  teamRef,
}: SessionProgressProps) => {
  const { getTeamQuery } = useSessionApi();

  const [open, setOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [jql, setJql] = useState<null | string>(null);
  const [copied, setCopied] = useState(false);

  const topLevel = stories.filter(s => !s.parentStoryId);
  const childrenByParent = new Map<string, QueueStory[]>();
  for (const story of stories) {
    if (story.parentStoryId) {
      const siblings = childrenByParent.get(story.parentStoryId) ?? [];
      siblings.push(story);
      childrenByParent.set(story.parentStoryId, siblings);
    }
  }
  const hostAddedCount = stories.length - topLevel.length;

  const total = topLevel.filter(s => s.state !== 'skipped').length;
  const done = topLevel.filter(s => s.state === 'estimated').length;
  const focused = stories.find(s => s.id === currentStoryId);
  const activeTop = focused?.parentStoryId
    ? topLevel.find(s => s.id === focused.parentStoryId)
    : focused;
  const activeCounts =
    activeTop !== undefined &&
    activeTop.state !== 'estimated' &&
    activeTop.state !== 'skipped';
  const current = Math.min(done + (activeCounts ? 1 : 0), total);
  const elapsedSeconds = useElapsedSeconds(focused?.startedAt);
  const overTimebox = elapsedSeconds > TIMEBOX_SECONDS;

  const splitParent = activeTop?.state === 'split' ? activeTop : undefined;
  const subtasks = splitParent
    ? childrenByParent.get(splitParent.id) ?? []
    : [];
  const subTotal = subtasks.filter(s => s.state !== 'skipped').length;
  const subDone = subtasks.filter(s => s.state === 'estimated').length;
  const subCurrent = Math.min(
    subDone + (focused?.parentStoryId ? 1 : 0),
    subTotal,
  );

  useEffect(() => {
    if (!open || !teamRef || jql !== null) {
      return;
    }
    void getTeamQuery(teamRef).then(setJql);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, teamRef]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!jql) {
      return;
    }
    await window.navigator.clipboard.writeText(jql);
    setCopied(true);
  };

  if (total === 0) {
    return null;
  }

  const trigger = (
    <button
      onClick={() => setOpen(!open)}
      type="button"
      style={{
        alignItems: 'center',
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderRadius: 'var(--bui-radius-3)',
        cursor: 'pointer',
        display: 'flex',
        font: 'inherit',
        gap: 12,
        padding: '6px 12px',
      }}
    >
      <Text as="span" variant="body-small" weight="bold">
        {`Story ${current} of ${total}`}
      </Text>
      {splitParent && (
        <Text
          as="span"
          variant="body-small"
          weight="bold"
          style={{ color: 'var(--bui-fg-info)' }}
        >
          {`· Subtask ${subCurrent} of ${subTotal}`}
        </Text>
      )}
      <span
        style={{
          background: 'var(--bui-bg-neutral-2)',
          borderRadius: 'var(--bui-radius-full)',
          display: 'block',
          height: 6,
          overflow: 'hidden',
          width: 96,
        }}
      >
        <span
          style={{
            background: 'var(--bui-fg-primary)',
            borderRadius: 'var(--bui-radius-full)',
            display: 'block',
            height: '100%',
            width: `${(done / total) * 100}%`,
          }}
        />
      </span>
      {focused && (
        <Flex
          align="center"
          gap="1"
          style={{
            color: overTimebox
              ? 'var(--bui-fg-warning)'
              : 'var(--bui-fg-secondary)',
            fontWeight: overTimebox ? 500 : undefined,
          }}
          title={overTimebox ? 'Running over the 5-minute timebox' : undefined}
        >
          <Clock size={14} />
          <Text
            as="span"
            variant="body-small"
            style={{ color: 'inherit', fontVariantNumeric: 'tabular-nums' }}
          >
            {formatDuration(elapsedSeconds)}
          </Text>
        </Flex>
      )}
      <ChevronDown size={16} style={{ color: 'var(--bui-fg-secondary)' }} />
    </button>
  );

  return (
    <InlinePopover isOpen={open} onOpenChange={setOpen} trigger={trigger}>
      <Flex
        align="center"
        gap="1"
        style={{
          color: 'var(--bui-fg-secondary)',
          flexShrink: 0,
          padding: '10px 12px',
        }}
      >
        <ListChecks size={14} />
        <Text
          as="span"
          variant="body-x-small"
          weight="bold"
          color="secondary"
          style={{ textTransform: 'uppercase' }}
        >
          Queue
        </Text>
      </Flex>

      <Box
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '0 4px 4px',
        }}
      >
        {topLevel.map(story => {
          const kids = childrenByParent.get(story.id) ?? [];
          return (
            <Box key={story.id}>
              <QueueRow
                currentStoryId={currentStoryId}
                onActivateStory={onActivateStory}
                story={story}
              />
              {story.state === 'split' && kids.length > 0 && (
                <Box
                  style={{
                    borderLeft: '1px solid var(--bui-border-1)',
                    marginLeft: 16,
                    paddingLeft: 4,
                  }}
                >
                  {kids.map(child => (
                    <QueueRow
                      currentStoryId={currentStoryId}
                      key={child.id}
                      onActivateStory={onActivateStory}
                      story={child}
                    />
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {jql && (
        <Box
          style={{ borderTop: '1px solid var(--bui-border-1)', flexShrink: 0 }}
        >
          <button
            aria-expanded={sourceOpen}
            onClick={() => setSourceOpen(value => !value)}
            type="button"
            style={{
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              font: 'inherit',
              gap: 8,
              padding: '10px 12px',
              width: '100%',
            }}
          >
            <Filter
              size={16}
              style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
            />
            <Text
              as="span"
              variant="body-small"
              truncate
              style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
            >
              {'Sourced from '}
              <Text as="span" variant="body-small" weight="bold">
                {teamName ?? 'team'}
              </Text>
              {' query'}
              {hostAddedCount > 0 && ` · ${hostAddedCount} added by host`}
            </Text>
            {sourceOpen ? (
              <ChevronUp
                size={16}
                style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
              />
            ) : (
              <ChevronDown
                size={16}
                style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
              />
            )}
          </button>

          {sourceOpen && (
            <Box style={{ padding: '0 12px 12px' }}>
              <Box
                as="pre"
                style={{
                  background: 'var(--bui-bg-neutral-2)',
                  border: '1px solid var(--bui-border-1)',
                  borderRadius: 'var(--bui-radius-2)',
                  fontFamily: 'var(--bui-font-monospace)',
                  fontSize: 12,
                  maxHeight: 176,
                  overflow: 'auto',
                  padding: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {jql}
              </Box>
              <Flex align="center" justify="between" style={{ marginTop: 8 }}>
                <Flex
                  align="center"
                  gap="1"
                  style={{ color: 'var(--bui-fg-secondary)' }}
                >
                  <Lock size={14} />
                  <Text
                    as="span"
                    variant="body-x-small"
                    style={{ color: 'inherit' }}
                  >
                    {`read-only · ${total} matched`}
                  </Text>
                </Flex>
                <button
                  onClick={() => {
                    void handleCopy();
                  }}
                  type="button"
                  style={{
                    alignItems: 'center',
                    background: 'transparent',
                    border: '1px solid var(--bui-border-1)',
                    borderRadius: 'var(--bui-radius-2)',
                    color: 'var(--bui-fg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    font: 'inherit',
                    gap: 6,
                    padding: '4px 10px',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </Flex>
            </Box>
          )}
        </Box>
      )}
    </InlinePopover>
  );
};

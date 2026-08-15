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
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Pencil, Play } from 'lucide-react';
import { Box, Button, Flex, Skeleton, Text } from '@backstage/ui';
import type {
  NewStory,
  Ticket,
} from '@backstage-community/plugin-pointing-poker-common';
import { useJira } from './hooks/useJira';
import { useSessionApi } from './hooks/useSessionApi';
import { buildDefaultJql } from './utils/jql';
import { formatRelativeShort } from './utils/relativeTime';

type PreviewRowProps = Readonly<{
  issue: Ticket;
  onToggle: (key: string) => void;
  selected: boolean;
}>;

type QueryStepProps = Readonly<{
  onBack: () => void;
  onStart: (jql: string, stories: NewStory[]) => void;
  starting: boolean;
  teamName: string;
  teamRef: string;
}>;

type RunState = 'error' | 'idle' | 'loading';

const PreviewRow = ({ issue, onToggle, selected }: PreviewRowProps) => (
  <Box
    onClick={() => onToggle(issue.key)}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggle(issue.key);
      }
    }}
    role="button"
    tabIndex={0}
    style={{
      borderBottom: '1px solid var(--bui-border-1)',
      cursor: 'pointer',
      display: 'flex',
      gap: 12,
      padding: 12,
    }}
  >
    <input
      checked={selected}
      readOnly
      type="checkbox"
      style={{ height: 16, marginTop: 4, pointerEvents: 'none', width: 16 }}
    />
    <Box style={{ flex: 1, minWidth: 0 }}>
      <Flex align="start" justify="between" gap="3">
        <Flex align="start" gap="2" style={{ minWidth: 0 }}>
          {issue.typeIconUrl && (
            <img
              alt={issue.type}
              title={issue.type}
              src={issue.typeIconUrl}
              style={{ height: 16, marginTop: 2, width: 16, flexShrink: 0 }}
            />
          )}
          <a
            href={issue.url ?? '#'}
            onClick={event => event.stopPropagation()}
            rel="noreferrer"
            target="_blank"
            title={issue.summary}
            style={{
              color: 'var(--bui-fg-primary)',
              display: '-webkit-box',
              fontSize: 15,
              lineHeight: 1.35,
              overflow: 'hidden',
              textDecoration: 'none',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {issue.summary}
          </a>
        </Flex>
        {issue.created && (
          <Text
            variant="body-x-small"
            color="secondary"
            style={{ flexShrink: 0 }}
            title={new Date(issue.created).toLocaleString()}
          >
            {formatRelativeShort(issue.created)}
          </Text>
        )}
      </Flex>

      <Flex
        align="center"
        gap="2"
        style={{ color: 'var(--bui-fg-secondary)', marginTop: 4 }}
      >
        <Text
          variant="body-x-small"
          style={{ color: 'inherit', fontFamily: 'var(--bui-font-monospace)' }}
        >
          {issue.key}
        </Text>
        {issue.author && (
          <>
            <Text variant="body-x-small" style={{ color: 'inherit' }}>
              ·
            </Text>
            <Flex align="center" gap="1" style={{ minWidth: 0 }}>
              {issue.authorAvatarUrl && (
                <img
                  alt=""
                  src={issue.authorAvatarUrl}
                  style={{
                    borderRadius: 'var(--bui-radius-full)',
                    height: 16,
                    width: 16,
                    flexShrink: 0,
                  }}
                />
              )}
              <Text
                variant="body-x-small"
                truncate
                style={{ color: 'inherit' }}
                title={issue.author}
              >
                {issue.author}
              </Text>
            </Flex>
          </>
        )}
        {issue.sprint && (
          <>
            <Text variant="body-x-small" style={{ color: 'inherit' }}>
              ·
            </Text>
            <Text variant="body-x-small" truncate style={{ color: 'inherit' }}>
              {issue.sprint}
            </Text>
          </>
        )}
      </Flex>
    </Box>
  </Box>
);

export const QueryStep = ({
  onBack,
  onStart,
  starting,
  teamName,
  teamRef,
}: QueryStepProps) => {
  const jira = useJira();
  const { getTeamQuery } = useSessionApi();
  const apiRef = useRef({ ...jira, getTeamQuery });
  apiRef.current = { ...jira, getTeamQuery };

  const [jql, setJql] = useState('');
  const [rows, setRows] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, setState] = useState<RunState>('loading');
  const [error, setError] = useState<null | string>(null);
  const [dirty, setDirty] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);

  const applyResults = (issues: Ticket[]) => {
    setRows(issues);
    setSelected(new Set(issues.map(issue => issue.key)));
    setState('idle');
    setDirty(false);
    if (issues.length > 0) {
      setEditorOpen(false);
    }
  };

  const fail = (caught: unknown) => {
    setError(caught instanceof Error ? caught.message : 'Query failed');
    setState('error');
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setState('loading');
      const saved = await apiRef.current.getTeamQuery(teamRef);
      const initial =
        saved ?? buildDefaultJql(await apiRef.current.getProjectKey(teamRef));
      if (!active) {
        return;
      }
      setJql(initial);
      try {
        const issues = await apiRef.current.runJql(initial);
        if (active) {
          applyResults(issues);
        }
      } catch (caught) {
        if (active) {
          fail(caught);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [teamRef]);

  const handleRun = async () => {
    setState('loading');
    setError(null);
    try {
      applyResults(await apiRef.current.runJql(jql));
    } catch (caught) {
      fail(caught);
    }
  };

  const toggle = (key: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  const toggleAll = () =>
    setSelected(prev =>
      prev.size === rows.length ? new Set() : new Set(rows.map(r => r.key)),
    );

  const status = (() => {
    if (state === 'loading') {
      return { color: 'var(--bui-fg-secondary)', text: 'Running…' };
    }
    if (state === 'error') {
      return { color: 'var(--bui-fg-danger)', text: error ?? 'Query failed' };
    }
    if (dirty) {
      return {
        color: 'var(--bui-fg-warning)',
        text: 'Query changed — run to refresh',
      };
    }
    return {
      color: 'var(--bui-fg-secondary)',
      text: `${rows.length} ticket${rows.length === 1 ? '' : 's'} found`,
    };
  })();

  return (
    <Flex
      direction="column"
      style={{
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderRadius: 'var(--bui-radius-4)',
        height: 'min(80vh, 760px)',
        margin: '0 auto',
        maxWidth: '48rem',
        padding: 'var(--bui-space-6)',
        width: '100%',
      }}
    >
      <Box>
        <Button
          iconStart={<ArrowLeft size={16} />}
          onClick={onBack}
          size="small"
          variant="tertiary"
        >
          Choose team
        </Button>
      </Box>

      <Text
        as="p"
        variant="body-x-small"
        weight="bold"
        color="secondary"
        style={{ marginTop: 12, textTransform: 'uppercase' }}
      >
        Step 2 of 2
      </Text>
      <Text
        as="h2"
        variant="title-medium"
        weight="bold"
        style={{ marginTop: 4 }}
      >
        What are we refining?
      </Text>
      <Text
        as="p"
        variant="body-small"
        color="secondary"
        style={{ marginTop: 4 }}
      >
        {`Pick the tickets for ${teamName}. Edit the query to change the list.`}
      </Text>

      {editorOpen ? (
        <>
          <textarea
            onChange={event => {
              setJql(event.target.value);
              setDirty(true);
            }}
            spellCheck={false}
            value={jql}
            style={{
              background: 'var(--bui-bg-app)',
              border: '1px solid var(--bui-border-1)',
              borderRadius: 'var(--bui-radius-3)',
              color: 'var(--bui-fg-primary)',
              fontFamily: 'var(--bui-font-monospace)',
              fontSize: 12,
              height: 128,
              marginTop: 'var(--bui-space-4)',
              outline: 'none',
              padding: 12,
              resize: 'vertical',
              width: '100%',
            }}
          />
          <Flex align="center" justify="between" style={{ marginTop: 8 }}>
            <Text variant="body-small" style={{ color: status.color }}>
              {status.text}
            </Text>
            <Button
              iconStart={<Play size={16} />}
              isDisabled={state === 'loading'}
              onClick={handleRun}
              variant="secondary"
            >
              Run
            </Button>
          </Flex>
        </>
      ) : (
        <Flex
          align="center"
          justify="between"
          gap="3"
          style={{
            background: 'var(--bui-bg-neutral-2)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-3)',
            marginTop: 'var(--bui-space-4)',
            padding: '8px 12px',
          }}
        >
          <Box style={{ minWidth: 0 }}>
            <Text
              as="div"
              truncate
              variant="body-x-small"
              style={{ fontFamily: 'var(--bui-font-monospace)' }}
            >
              {jql.replace(/\s+/g, ' ')}
            </Text>
            <Text
              as="div"
              variant="body-x-small"
              style={{ color: status.color }}
            >
              {status.text}
            </Text>
          </Box>
          <Button
            iconStart={<Pencil size={16} />}
            onClick={() => setEditorOpen(true)}
            size="small"
            variant="secondary"
          >
            Edit query
          </Button>
        </Flex>
      )}

      {state === 'idle' && rows.length > 0 && (
        <Flex align="center" justify="between" style={{ marginTop: 12 }}>
          <Text variant="body-small" color="secondary">
            {`${selected.size} of ${rows.length} selected`}
          </Text>
          <button
            onClick={toggleAll}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--bui-fg-primary)',
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: 500,
            }}
          >
            {selected.size === rows.length ? 'Clear all' : 'Select all'}
          </button>
        </Flex>
      )}

      <Box
        style={{
          border: '1px solid var(--bui-border-1)',
          borderRadius: 'var(--bui-radius-3)',
          flex: 1,
          marginTop: 8,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {state === 'loading' && (
          <Flex direction="column" gap="2" p="4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} width="100%" height={24} />
            ))}
          </Flex>
        )}
        {state === 'error' && (
          <Box p="4">
            <Text variant="body-small" color="danger">
              {error ?? 'Query failed'}
            </Text>
          </Box>
        )}
        {state === 'idle' && rows.length === 0 && (
          <Box p="4">
            <Text variant="body-small" color="secondary">
              No tickets match — loosen the query.
            </Text>
          </Box>
        )}
        {state === 'idle' &&
          rows.length > 0 &&
          rows.map(issue => (
            <PreviewRow
              issue={issue}
              key={issue.key}
              onToggle={toggle}
              selected={selected.has(issue.key)}
            />
          ))}
      </Box>

      <Box style={{ flexShrink: 0, marginTop: 'var(--bui-space-4)' }}>
        <Button
          iconEnd={<ArrowUpRight size={16} />}
          isDisabled={starting || selected.size === 0}
          onClick={() =>
            onStart(
              jql,
              rows
                .filter(issue => selected.has(issue.key))
                .map(issue => ({ ticketKey: issue.key, title: issue.summary })),
            )
          }
          style={{ width: '100%' }}
          variant="primary"
        >
          {starting
            ? 'Starting…'
            : `Start session · ${selected.size} ticket${
                selected.size === 1 ? '' : 's'
              }`}
        </Button>
      </Box>
    </Flex>
  );
};

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
import { AlertTriangle, ListTree, RotateCcw } from 'lucide-react';
import { Box, Button, Checkbox, Flex, Text } from '@backstage/ui';
import type { Subtask } from '@backstage-community/plugin-pointing-poker-common';

type SubtaskChipProps = Readonly<{
  count: number;
  onClick?: () => void;
}>;

const chipStyle = {
  alignItems: 'center',
  background: 'color-mix(in srgb, var(--bui-bg-info) 22%, transparent)',
  border: 'none',
  borderRadius: 'var(--bui-radius-2)',
  color: 'var(--bui-fg-info)',
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: '0.875rem',
  fontWeight: 500,
  gap: '0.375rem',
  padding: '0.25rem 0.625rem',
} as const;

// The "N subtasks" affordance next to the story key. Everyone sees it; only the
// host gets a click handler.
export const SubtaskChip = ({ count, onClick }: SubtaskChipProps) => {
  const label = `${count} ${count === 1 ? 'subtask' : 'subtasks'}`;

  if (!onClick) {
    return (
      <span style={{ ...chipStyle, cursor: 'default' }}>
        <ListTree size={16} />
        {label}
      </span>
    );
  }

  return (
    <button onClick={onClick} style={chipStyle} type="button">
      <ListTree size={16} />
      {label}
    </button>
  );
};

const priorityColors = (
  priority: string,
): Readonly<{ background: string; color: string }> => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'highest':
      return {
        background: 'color-mix(in srgb, var(--bui-bg-danger) 22%, transparent)',
        color: 'var(--bui-fg-danger)',
      };
    case 'medium':
      return {
        background:
          'color-mix(in srgb, var(--bui-bg-warning) 25%, transparent)',
        color: 'var(--bui-fg-warning)',
      };
    default:
      return {
        background: 'var(--bui-bg-neutral-2)',
        color: 'var(--bui-fg-secondary)',
      };
  }
};

const PriorityPill = ({ priority }: { priority: string }) => {
  const colors = priorityColors(priority);
  return (
    <span
      style={{
        background: colors.background,
        borderRadius: 'var(--bui-radius-full)',
        color: colors.color,
        flexShrink: 0,
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '0.125rem 0.5rem',
      }}
    >
      {priority}
    </span>
  );
};

type SubtaskPickerProps = Readonly<{
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (selected: Subtask[]) => void;
  subtasks: ReadonlyArray<Subtask>;
  voteCount: number;
}>;

// Host-only checklist for splitting a story into the subtasks worth pointing
// now. Already-estimated subtasks default off (with a re-estimate hint); the
// rest default on.
export const SubtaskPicker = ({
  busy,
  onCancel,
  onConfirm,
  subtasks,
  voteCount,
}: SubtaskPickerProps) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        subtasks.filter(s => s.storyPoints === undefined).map(s => s.key),
      ),
  );

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

  const selectedCount = selected.size;

  return (
    <Box
      style={{
        background: 'color-mix(in srgb, var(--bui-bg-info) 8%, transparent)',
        border: '1px solid var(--bui-border-info)',
        borderRadius: 'var(--bui-radius-4)',
      }}
    >
      <Flex
        align="center"
        justify="between"
        style={{ padding: 'var(--bui-space-2) var(--bui-space-4)' }}
      >
        <Flex align="center" gap="2">
          <ListTree size={16} style={{ color: 'var(--bui-fg-info)' }} />
          <Text as="span" variant="body-small" weight="bold">
            Estimate subtasks instead
          </Text>
        </Flex>
        <Text as="span" color="secondary" variant="body-x-small">
          Host only
        </Text>
      </Flex>

      <ul
        style={{
          borderBottom: '1px solid var(--bui-border-1)',
          borderTop: '1px solid var(--bui-border-1)',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {subtasks.map(subtask => {
          const isSelected = selected.has(subtask.key);
          const prePointed = subtask.storyPoints !== undefined;
          return (
            <li
              key={subtask.key}
              style={{ borderTop: '1px solid var(--bui-border-1)' }}
            >
              <label
                style={{
                  alignItems: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 'var(--bui-space-3)',
                  padding: 'var(--bui-space-2) var(--bui-space-4)',
                }}
              >
                <Checkbox
                  isSelected={isSelected}
                  onChange={() => toggle(subtask.key)}
                />
                <Text
                  as="span"
                  color="secondary"
                  style={{ fontFamily: 'var(--bui-font-monospace)' }}
                  variant="body-x-small"
                >
                  {subtask.key}
                </Text>
                <Text
                  as="span"
                  color={isSelected ? undefined : 'secondary'}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={subtask.summary}
                  variant="body-small"
                >
                  {subtask.summary}
                </Text>
                {prePointed && (
                  <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
                    <RotateCcw
                      size={12}
                      style={{ color: 'var(--bui-fg-secondary)' }}
                    />
                    <Text
                      as="span"
                      color="secondary"
                      variant="body-x-small"
                    >{`re-estimate · ${subtask.storyPoints}`}</Text>
                  </Flex>
                )}
                {subtask.priority && (
                  <PriorityPill priority={subtask.priority} />
                )}
              </label>
            </li>
          );
        })}
      </ul>

      {voteCount > 0 && (
        <Flex
          align="center"
          gap="2"
          style={{ padding: 'var(--bui-space-2) var(--bui-space-4) 0' }}
        >
          <AlertTriangle
            size={14}
            style={{ color: 'var(--bui-fg-warning)', flexShrink: 0 }}
          />
          <Text
            as="span"
            style={{ color: 'var(--bui-fg-warning)' }}
            variant="body-x-small"
          >
            {`Splitting discards ${voteCount} ${
              voteCount === 1 ? 'vote' : 'votes'
            } on this story.`}
          </Text>
        </Flex>
      )}

      <Flex
        align="center"
        justify="between"
        style={{ padding: 'var(--bui-space-2) var(--bui-space-4)' }}
      >
        <Text as="span" color="secondary" variant="body-small">
          {`${selectedCount} selected · parent rolls up`}
        </Text>
        <Flex align="center" gap="2">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button
            isDisabled={busy || selectedCount === 0}
            onClick={() => onConfirm(subtasks.filter(s => selected.has(s.key)))}
            variant="primary"
          >
            {`Queue ${selectedCount} ${
              selectedCount === 1 ? 'subtask' : 'subtasks'
            }`}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

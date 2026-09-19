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
import { ArrowUpNarrowWide } from 'lucide-react';
import { Box, Button, Flex, Text } from '@backstage/ui';
import type { SplitResolution } from '@backstage-community/plugin-pointing-poker-common';

type SplitRollupProps = Readonly<{
  busy?: boolean;
  estimatedCount: number;
  onResolve: (mode: SplitResolution, estimate?: string) => void;
  parentEstimate?: string;
  parentKey?: string;
  subtaskTotal: null | number;
}>;

// Shown once every subtask of a split parent is estimated. The parent's own
// number is a separate ticket field, so a sum is offered — not assumed.
export const SplitRollup = ({
  busy,
  estimatedCount,
  onResolve,
  parentEstimate,
  parentKey,
  subtaskTotal,
}: SplitRollupProps) => {
  const parentLabel = parentKey ?? 'The parent';
  const total = subtaskTotal === null ? null : String(subtaskTotal);

  return (
    <Box
      style={{
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-info)',
        borderRadius: 'var(--bui-radius-5)',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
        padding: 'var(--bui-space-4)',
      }}
    >
      <Flex align="center" gap="2">
        <ArrowUpNarrowWide size={16} style={{ color: 'var(--bui-fg-info)' }} />
        <Text as="span" variant="body-small" weight="bold">
          {`All ${estimatedCount} ${
            estimatedCount === 1 ? 'subtask' : 'subtasks'
          } estimated`}
        </Text>
      </Flex>
      <Text
        as="p"
        color="secondary"
        style={{ marginTop: 'var(--bui-space-1)' }}
        variant="body-small"
      >
        {total === null
          ? `${parentLabel} has no estimate of its own yet.`
          : `Subtask total is ${total}. ${parentLabel} has no estimate of its own.`}
        {parentEstimate && ` ${parentLabel} currently ${parentEstimate}.`}
      </Text>

      <Flex
        align="center"
        gap="2"
        style={{ flexWrap: 'wrap', marginTop: 'var(--bui-space-3)' }}
      >
        {total !== null && (
          <Button
            isDisabled={busy}
            onClick={() => onResolve('rollup', total)}
            variant="primary"
          >
            {`Set parent to ${total}`}
          </Button>
        )}
        <Button
          isDisabled={busy}
          onClick={() => onResolve('separate')}
          variant="secondary"
        >
          Vote on parent separately
        </Button>
        <Button
          isDisabled={busy}
          onClick={() => onResolve('leave')}
          variant="secondary"
        >
          Leave unestimated
        </Button>
      </Flex>
    </Box>
  );
};

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
import { Box, Flex, Text } from '@backstage/ui';
import type { TicketDetail } from '@backstage-community/plugin-pointing-poker-common';
import { Markdown } from '../common/Markdown';
import { TicketKeyBadge } from './TicketCard';
import { AttachmentMedia } from './utils/AttachmentMedia';

type SubtaskBreadcrumbProps = Readonly<{
  parentKey: string;
  parentTicket?: TicketDetail;
}>;

export const SubtaskBreadcrumb = ({
  parentKey,
  parentTicket,
}: SubtaskBreadcrumbProps) => (
  <Flex align="center" gap="2">
    <TicketKeyBadge fallbackKey={parentKey} ticket={parentTicket} />
    <ChevronRight size={16} style={{ color: 'var(--bui-fg-secondary)' }} />
  </Flex>
);

type ParentContextProps = Readonly<{
  ticket?: TicketDetail;
}>;

// Collapsible view of the parent story while pointing one of its subtasks — the
// parent's context stays one click away without pushing the subtask's own
// description below the fold.
export const ParentContext = ({ ticket }: ParentContextProps) => {
  const [open, setOpen] = useState(false);

  if (!ticket) {
    return null;
  }

  const attachments = ticket.attachments ?? [];

  return (
    <Box
      style={{
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderRadius: 'var(--bui-radius-3)',
      }}
    >
      <button
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        style={{
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          gap: 'var(--bui-space-2)',
          padding: 'var(--bui-space-2) var(--bui-space-3)',
          textAlign: 'left',
          width: '100%',
        }}
        type="button"
      >
        {open ? (
          <ChevronDown size={16} style={{ flexShrink: 0 }} />
        ) : (
          <ChevronRight size={16} style={{ flexShrink: 0 }} />
        )}
        <Text
          as="span"
          style={{ flexShrink: 0 }}
          variant="body-small"
          weight="bold"
        >
          Parent context
        </Text>
        <Text
          as="span"
          color="secondary"
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={ticket.summary}
          variant="body-small"
        >
          {ticket.summary}
        </Text>
      </button>
      {open && (ticket.description || attachments.length > 0) && (
        <Box
          style={{
            borderTop: '1px solid var(--bui-border-1)',
            maxHeight: '14rem',
            overflowY: 'auto',
            padding: 'var(--bui-space-2) var(--bui-space-3)',
          }}
        >
          <Markdown text={ticket.description} />
          {attachments.map(attachment => (
            <AttachmentMedia attachment={attachment} key={attachment.id} />
          ))}
        </Box>
      )}
    </Box>
  );
};

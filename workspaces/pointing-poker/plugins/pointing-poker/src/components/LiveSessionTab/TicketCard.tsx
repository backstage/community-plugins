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
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Link,
  Text,
} from '@backstage/ui';
import type { TicketDetail } from '@backstage-community/plugin-pointing-poker-common';
import { CharacterAvatar } from './CharacterAvatar';
import { Markdown } from '../common/Markdown';
import { TicketComments } from './TicketComments';
import { AttachmentMedia } from './utils/AttachmentMedia';
import { formatDateTime } from './utils/relativeTime';

type TicketCardProps = Readonly<{
  actions?: ReactNode;
  badge?: ReactNode;
  breadcrumb?: ReactNode;
  children?: ReactNode;
  contextPanel?: ReactNode;
  fallbackTitle?: string;
  ticket?: TicketDetail;
}>;

const JiraIcon = () => (
  <svg
    fill="currentColor"
    height={16}
    viewBox="0 0 24 24"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z" />
  </svg>
);

const TicketTypeIcon = ({ ticket }: { ticket?: TicketDetail }) => {
  if (!ticket?.typeIconUrl) {
    return <JiraIcon />;
  }
  return (
    <img
      alt={ticket.type ?? 'Issue type'}
      height={16}
      src={ticket.typeIconUrl}
      style={{ flexShrink: 0 }}
      title={ticket.type}
      width={16}
    />
  );
};

type TicketKeyBadgeProps = Readonly<{
  fallbackKey?: string;
  ticket?: TicketDetail;
}>;

export const TicketKeyBadge = ({
  fallbackKey,
  ticket,
}: TicketKeyBadgeProps) => {
  const key = ticket?.key ?? fallbackKey;

  if (!key) {
    return (
      <Flex
        align="center"
        gap="2"
        style={{
          background: 'var(--bui-bg-neutral-2)',
          borderRadius: 'var(--bui-radius-2)',
          padding: '0.25rem 0.75rem',
          width: 'fit-content',
        }}
      >
        <JiraIcon />
        <Text
          as="span"
          style={{ fontFamily: 'var(--bui-font-monospace)' }}
          variant="body-small"
          weight="bold"
        >
          Story
        </Text>
      </Flex>
    );
  }

  const content = (
    <Flex
      align="center"
      gap="2"
      style={{
        background: 'var(--bui-bg-neutral-2)',
        borderRadius: 'var(--bui-radius-2)',
        padding: '0.25rem 0.75rem',
        width: 'fit-content',
      }}
    >
      <TicketTypeIcon ticket={ticket} />
      <Text
        as="span"
        style={{ fontFamily: 'var(--bui-font-monospace)' }}
        variant="body-small"
        weight="bold"
      >
        {key}
      </Text>
    </Flex>
  );

  return ticket?.url ? (
    <Link href={ticket.url} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  ) : (
    content
  );
};

export const TicketCard = ({
  actions,
  badge,
  breadcrumb,
  children,
  contextPanel,
  fallbackTitle,
  ticket,
}: TicketCardProps) => {
  const attachments = ticket?.attachments ?? [];

  return (
    <Card
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <CardHeader>
        <Flex align="center" justify="between" style={{ width: '100%' }}>
          <Flex align="center" gap="2">
            {breadcrumb}
            <TicketKeyBadge ticket={ticket} />
            {badge}
          </Flex>
          {(actions || ticket?.key) && (
            <Flex align="center" gap="2">
              {actions}
              {ticket?.key && <TicketComments ticketKey={ticket.key} />}
            </Flex>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        <Text as="h2" variant="title-small" weight="bold">
          {ticket?.summary ?? fallbackTitle ?? 'Loading…'}
        </Text>
        {ticket?.author && (
          <Flex
            align="center"
            gap="2"
            style={{ marginTop: 'var(--bui-space-2)' }}
          >
            <CharacterAvatar name={ticket.author} size={24} />
            <Text as="span" color="secondary" variant="body-small">
              {'Created by '}
              <Text as="span" variant="body-small" weight="bold">
                {ticket.author}
              </Text>
              {ticket.createdAt && ` · ${formatDateTime(ticket.createdAt)}`}
            </Text>
          </Flex>
        )}
        {contextPanel && (
          <Box style={{ marginTop: 'var(--bui-space-4)' }}>{contextPanel}</Box>
        )}
        {!children &&
          (Boolean(ticket?.description) || attachments.length > 0) && (
            <Box
              style={{
                flex: 1,
                marginTop: 'var(--bui-space-6)',
                minHeight: 0,
                overflowY: 'auto',
              }}
            >
              <Markdown text={ticket?.description} />
              {attachments.map(attachment => (
                <AttachmentMedia attachment={attachment} key={attachment.id} />
              ))}
            </Box>
          )}
        {children && (
          <Box
            style={{
              flex: 1,
              marginTop: 'var(--bui-space-4)',
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            {children}
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

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
import { MoreHorizontal, XCircle } from 'lucide-react';
import { Box, Button, ButtonIcon, Flex, Text } from '@backstage/ui';
import type { SessionSummary } from '@backstage-community/plugin-pointing-poker-common';
import { formatRelativeTime } from './utils/relativeTime';
import type { TeamColor } from './utils/teamColor';

type SessionCardProps = Readonly<{
  color: TeamColor;
  isHost: boolean;
  onEnd: () => void;
  onOpen: () => void;
  session: SessionSummary;
  teamName: string;
}>;

type Status = Readonly<{
  color: string;
  dot: string;
  label: string;
}>;

const getStatus = (session: SessionSummary): Status => {
  if (session.activeCount === 0) {
    return {
      color: 'var(--bui-fg-secondary)',
      dot: 'var(--bui-fg-disabled)',
      label: 'idle',
    };
  }
  if (session.votingCount > 0) {
    return {
      color: 'var(--bui-fg-info)',
      dot: 'var(--bui-fg-info)',
      label: 'voting now',
    };
  }
  return {
    color: 'var(--bui-fg-success)',
    dot: 'var(--bui-fg-success)',
    label: 'active now',
  };
};

type InlinePopoverProps = Readonly<{
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  width: number;
}>;

const InlinePopover = ({
  children,
  isOpen,
  onOpenChange,
  trigger,
  width,
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
            marginTop: 4,
            padding: 'var(--bui-space-1)',
            position: 'absolute',
            right: 0,
            top: '100%',
            width,
            zIndex: 50,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

export const SessionCard = ({
  color,
  isHost,
  onEnd,
  onOpen,
  session,
  teamName,
}: SessionCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const status = getStatus(session);

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirming(false);
  };

  return (
    <Flex
      align="center"
      justify="between"
      gap="4"
      style={{
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderLeft: `4px solid ${color.border}`,
        borderRadius: 'var(--bui-radius-3)',
        padding: 'var(--bui-space-4)',
      }}
    >
      <Box style={{ minWidth: 0 }}>
        <Flex align="center" gap="3" style={{ flexWrap: 'wrap' }}>
          <Box
            style={{
              alignItems: 'center',
              background: color.chipBg,
              borderRadius: 'var(--bui-radius-full)',
              color: color.chipText,
              display: 'inline-flex',
              fontSize: 12,
              fontWeight: 500,
              gap: 6,
              padding: '2px 8px',
            }}
          >
            <span
              style={{
                background: color.dot,
                borderRadius: 'var(--bui-radius-full)',
                height: 6,
                width: 6,
              }}
            />
            {teamName}
          </Box>
          <Flex
            align="center"
            gap="1"
            style={{ color: status.color, fontSize: 12, fontWeight: 500 }}
          >
            <span
              style={{
                background: status.dot,
                borderRadius: 'var(--bui-radius-full)',
                height: 6,
                width: 6,
              }}
            />
            {status.label}
          </Flex>
          {session.isDuplicate && (
            <Box
              style={{
                background: 'var(--bui-bg-warning)',
                borderRadius: 'var(--bui-radius-full)',
                color: 'var(--bui-fg-warning)',
                fontSize: 12,
                fontWeight: 500,
                padding: '2px 8px',
              }}
            >
              looks like a duplicate
            </Box>
          )}
        </Flex>

        <Text
          as="h3"
          variant="body-large"
          weight="bold"
          style={{ marginTop: 6 }}
        >
          {session.name}
        </Text>

        <Text
          as="p"
          variant="body-small"
          color="secondary"
          style={{ marginTop: 6 }}
        >
          {`Hosted by ${
            isHost ? 'you' : session.createdByName
          } · ${formatRelativeTime(session.createdAt)} · ${
            session.joinedCount
          } joined`}
        </Text>
      </Box>

      <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
        <Button onClick={onOpen} variant={isHost ? 'primary' : 'secondary'}>
          {isHost ? 'Join' : 'Open'}
        </Button>

        {isHost && (
          <InlinePopover
            isOpen={menuOpen}
            onOpenChange={open => (open ? setMenuOpen(true) : closeMenu())}
            trigger={
              <ButtonIcon
                aria-label="Session options"
                icon={<MoreHorizontal size={16} />}
                onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
                variant="tertiary"
              />
            }
            width={240}
          >
            {confirming ? (
              <Flex
                direction="column"
                gap="2"
                style={{ padding: 'var(--bui-space-2)' }}
              >
                <Text as="p" variant="body-small">
                  End this session for everyone?
                </Text>
                <Flex justify="end" gap="2">
                  <Button
                    onClick={() => setConfirming(false)}
                    size="small"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    destructive
                    onClick={() => {
                      closeMenu();
                      onEnd();
                    }}
                    size="small"
                    variant="primary"
                  >
                    End
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                style={{
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--bui-radius-2)',
                  color: 'var(--bui-fg-danger)',
                  cursor: 'pointer',
                  display: 'flex',
                  font: 'inherit',
                  gap: 8,
                  padding: 8,
                  textAlign: 'left',
                  width: '100%',
                }}
                type="button"
              >
                <XCircle size={16} />
                End session
              </button>
            )}
          </InlinePopover>
        )}
      </Flex>
    </Flex>
  );
};

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
import { useEffect, useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Box, Button, Flex, Text } from '@backstage/ui';
import type { SessionSummary } from '@backstage-community/plugin-pointing-poker-common';
import { SessionCard } from './SessionCard';
import { useLobby } from './hooks/useLobby';
import { teamColor } from './utils/teamColor';

const UNDO_WINDOW_MS = 5000;

type LobbyProps = Readonly<{
  currentUserId: string;
  onEndSession: (sessionId: string) => Promise<void>;
  onJoin: (session: SessionSummary) => void;
  onReopenSession: (sessionId: string) => Promise<void>;
  onStartCreate: () => void;
  userTeams: Team[];
}>;

type Team = Readonly<{
  name: string;
  ref: string;
}>;

export const Lobby = ({
  currentUserId,
  onEndSession,
  onJoin,
  onReopenSession,
  onStartCreate,
  userTeams,
}: LobbyProps) => {
  const [endedId, setEndedId] = useState<null | string>(null);

  const teamRefs = userTeams.map(t => t.ref);
  const { loading, retry, value: sessions } = useLobby(teamRefs);
  const openSessions = sessions ?? [];

  useEffect(() => {
    if (!endedId) {
      return undefined;
    }
    const timer = setTimeout(() => setEndedId(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [endedId]);

  const teamName = (ref: string): string =>
    userTeams.find(t => t.ref === ref)?.name ?? 'Unknown team';

  const isHost = (session: SessionSummary): boolean =>
    session.createdBy === currentUserId;

  const hostedCount = openSessions.filter(isHost).length;

  const subtitle = (() => {
    if (loading && openSessions.length === 0) {
      return 'Looking for open sessions…';
    }
    if (openSessions.length === 0) {
      return 'No sessions are open across your teams today — start a fresh one.';
    }
    const sessionLabel =
      openSessions.length === 1
        ? '1 session open'
        : `${openSessions.length} sessions open`;
    return hostedCount > 0
      ? `${sessionLabel} · you host ${hostedCount} of them`
      : `${sessionLabel}. Each card shows its team.`;
  })();

  const handleEnd = async (sessionId: string) => {
    await onEndSession(sessionId);
    setEndedId(sessionId);
    retry();
  };

  const handleUndo = async () => {
    if (!endedId) {
      return;
    }
    const id = endedId;
    setEndedId(null);
    await onReopenSession(id);
    retry();
  };

  return (
    <Box
      style={{
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderRadius: 'var(--bui-radius-4)',
        margin: '0 auto',
        maxWidth: '42rem',
        padding: 'var(--bui-space-6)',
      }}
    >
      <Text as="h2" variant="title-medium" weight="bold">
        Open sessions
      </Text>
      <Text
        as="p"
        variant="body-small"
        color="secondary"
        style={{ marginTop: 4 }}
      >
        {subtitle}
      </Text>

      <Flex
        direction="column"
        gap="3"
        style={{ marginTop: 'var(--bui-space-4)' }}
      >
        {openSessions.map(session => (
          <SessionCard
            color={teamColor(session.teamRef)}
            isHost={isHost(session)}
            key={session.id}
            onEnd={() => handleEnd(session.id)}
            onOpen={() => onJoin(session)}
            session={session}
            teamName={teamName(session.teamRef)}
          />
        ))}

        <button
          onClick={onStartCreate}
          type="button"
          style={{
            alignItems: 'center',
            background: 'transparent',
            border: '1px dashed var(--bui-fg-info)',
            borderRadius: 'var(--bui-radius-3)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            font: 'inherit',
            gap: 2,
            justifyContent: 'center',
            padding: 16,
            width: '100%',
          }}
        >
          <Flex
            align="center"
            gap="2"
            style={{ color: 'var(--bui-fg-info)', fontWeight: 500 }}
          >
            <Plus size={16} />
            Start a new session
          </Flex>
          <Text as="span" variant="body-x-small" color="secondary">
            you’ll choose the team next
          </Text>
        </button>
      </Flex>

      {endedId && (
        <Flex
          align="center"
          justify="between"
          style={{
            background: 'var(--bui-bg-neutral-2)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-3)',
            marginTop: 'var(--bui-space-4)',
            padding: '12px 16px',
          }}
        >
          <Flex align="center" gap="2">
            <CheckCircle2
              size={16}
              style={{ color: 'var(--bui-fg-secondary)' }}
            />
            <Text as="span" variant="body-small">
              Session ended.
            </Text>
          </Flex>
          <Button onClick={handleUndo} size="small" variant="secondary">
            Undo
          </Button>
        </Flex>
      )}
    </Box>
  );
};

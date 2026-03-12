/*
 * Copyright 2025 The Backstage Authors
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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import type { ChatSessionSummary } from '../../types';
import { SessionItem } from './SessionItem';
import type { DeleteState } from './SessionItem';

export interface GroupedSessionListProps {
  groups: { label: string; sessions: ChatSessionSummary[] }[];
  activeSessionId?: string;
  showAllUsers: boolean;
  searchQuery: string;
  deleteState: DeleteState;
  formatTime: (date: Date) => string;
  onSelectSession: (sessionId: string, adminView?: boolean) => void;
}

/**
 * Renders date-grouped session list with labels (Today, Yesterday, etc.).
 */
export function GroupedSessionList({
  groups,
  activeSessionId,
  showAllUsers,
  searchQuery,
  deleteState,
  formatTime,
  onSelectSession,
}: GroupedSessionListProps) {
  const theme = useTheme();

  if (groups.length === 0 && searchQuery.trim()) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary }}
        >
          No conversations matching "{searchQuery}"
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {groups.map(group => (
        <Box key={group.label}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              px: 1.5,
              pt: 1.5,
              pb: 0.5,
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: alpha(theme.palette.text.secondary, 0.7),
            }}
          >
            {group.label}
          </Typography>
          {group.sessions.map((session, index) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={activeSessionId === session.id}
              showAllUsers={showAllUsers}
              deleteState={deleteState}
              formatTime={formatTime}
              onSelect={() => onSelectSession(session.id, showAllUsers)}
              fadeIndex={index}
            />
          ))}
        </Box>
      ))}
    </>
  );
}

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
import { Box, Flex, Text } from '@backstage/ui';
import { useTeamMembers } from '../LiveSessionTab/hooks/useTeamMembers';
import { HistorySessionCard } from './HistorySessionCard';
import { useHistory } from './hooks/useHistory';

export function HistoryTab() {
  const { loading: teamsLoading, userTeams } = useTeamMembers('');
  const teams = userTeams ?? [];
  const teamRefs = teams.map(team => team.ref);
  const teamNames = new Map(teams.map(team => [team.ref, team.name]));

  const { error, loading, value: sessions } = useHistory(teamRefs);

  if (teamsLoading || loading) {
    return (
      <Box p="6">
        <Text color="secondary">Loading…</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="6">
        <Text color="danger">{`Could not load history: ${error.message}`}</Text>
      </Box>
    );
  }

  const items = sessions ?? [];

  return (
    <Box p="6" style={{ margin: '0 auto', maxWidth: '64rem', width: '100%' }}>
      <Text as="h2" variant="title-large" weight="bold">
        History
      </Text>
      <Text
        as="p"
        color="secondary"
        style={{ marginTop: 'var(--bui-space-1)' }}
        variant="body-small"
      >
        Every refinement session for your teams — past and ongoing.
      </Text>

      {items.length === 0 ? (
        <Text
          as="p"
          color="secondary"
          style={{ marginTop: 'var(--bui-space-8)' }}
          variant="body-small"
        >
          No sessions yet — start one from Live session.
        </Text>
      ) : (
        <Flex
          direction="column"
          gap="3"
          style={{ marginTop: 'var(--bui-space-6)' }}
        >
          {items.map(session => (
            <HistorySessionCard
              key={session.id}
              session={session}
              teamName={teamNames.get(session.teamRef ?? '') ?? 'Unknown team'}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}

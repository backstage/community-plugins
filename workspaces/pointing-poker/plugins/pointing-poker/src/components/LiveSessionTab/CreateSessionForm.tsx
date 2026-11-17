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
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Users,
} from 'lucide-react';
import { Box, Button, Flex, Text } from '@backstage/ui';
import { useSessionApi } from './hooks/useSessionApi';

type CreateSessionFormProps = Readonly<{
  creating: boolean;
  initialTeamRef: string;
  onBack: () => void;
  onConfirm: (name: string, teamRef: string) => void;
  teams: Team[];
}>;

type Team = Readonly<{
  name: string;
  ref: string;
}>;

const defaultSessionName = (): string => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Refinement session (${today})`;
};

export const CreateSessionForm = ({
  creating,
  initialTeamRef,
  onBack,
  onConfirm,
  teams,
}: CreateSessionFormProps) => {
  const { getTeamQuery } = useSessionApi();

  const [name, setName] = useState<string>(defaultSessionName);
  const [selected, setSelected] = useState<string>(
    initialTeamRef || (teams[0]?.ref ?? ''),
  );
  const [hasSavedQuery, setHasSavedQuery] = useState(false);

  useEffect(() => {
    if (!selected) {
      setHasSavedQuery(false);
      return undefined;
    }
    let active = true;
    void getTeamQuery(selected).then(saved => {
      if (active) {
        setHasSavedQuery(Boolean(saved));
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const canCreate = name.trim().length > 0 && selected.length > 0;

  let nextLabel = 'Next';
  if (creating) {
    nextLabel = 'Starting…';
  } else if (hasSavedQuery) {
    nextLabel = 'Start session';
  }

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
          New session
        </Button>
      </Box>

      <Text
        as="p"
        variant="body-x-small"
        weight="bold"
        color="secondary"
        style={{ marginTop: 12, textTransform: 'uppercase' }}
      >
        Step 1 of 2
      </Text>
      <Text
        as="h2"
        variant="title-medium"
        weight="bold"
        style={{ marginTop: 4 }}
      >
        Name it and pick a team
      </Text>
      <Text
        as="p"
        variant="body-small"
        color="secondary"
        style={{ marginTop: 4 }}
      >
        You can change the name — we’ve filled in today’s by default.
      </Text>

      <Box style={{ marginTop: 'var(--bui-space-6)' }}>
        <Text
          as="label"
          variant="body-small"
          weight="bold"
          style={{ display: 'block', marginBottom: 6 }}
        >
          Session name
        </Text>
        <input
          onChange={event => setName(event.target.value)}
          type="text"
          value={name}
          style={{
            background: 'var(--bui-bg-neutral-1)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-3)',
            color: 'var(--bui-fg-primary)',
            fontSize: 16,
            outline: 'none',
            padding: '8px 12px',
            width: '100%',
          }}
        />
      </Box>

      <Flex
        direction="column"
        style={{ flex: 1, marginTop: 'var(--bui-space-4)', minHeight: 0 }}
      >
        <Text
          as="span"
          variant="body-small"
          weight="bold"
          style={{ display: 'block', marginBottom: 6 }}
        >
          Team
        </Text>
        <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Flex direction="column" gap="2">
            {teams.map(team => {
              const active = team.ref === selected;
              return (
                <button
                  key={team.ref}
                  onClick={() => setSelected(team.ref)}
                  type="button"
                  style={{
                    alignItems: 'center',
                    background: active
                      ? 'var(--bui-bg-neutral-2)'
                      : 'transparent',
                    border: active
                      ? '2px solid var(--bui-border-2)'
                      : '2px solid var(--bui-border-1)',
                    borderRadius: 'var(--bui-radius-3)',
                    cursor: 'pointer',
                    display: 'flex',
                    font: 'inherit',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <Flex align="center" gap="2" style={{ fontWeight: 500 }}>
                    <Users
                      size={16}
                      style={{ color: 'var(--bui-fg-secondary)' }}
                    />
                    {team.name}
                  </Flex>
                  {active && (
                    <Check
                      size={16}
                      style={{ color: 'var(--bui-fg-primary)' }}
                    />
                  )}
                </button>
              );
            })}
          </Flex>
        </Box>
      </Flex>

      <Box style={{ flexShrink: 0, marginTop: 'var(--bui-space-6)' }}>
        <Button
          iconEnd={
            hasSavedQuery ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowRight size={16} />
            )
          }
          isDisabled={creating || !canCreate}
          onClick={() => onConfirm(name.trim(), selected)}
          style={{ width: '100%' }}
          variant="primary"
        >
          {nextLabel}
        </Button>
      </Box>
    </Flex>
  );
};

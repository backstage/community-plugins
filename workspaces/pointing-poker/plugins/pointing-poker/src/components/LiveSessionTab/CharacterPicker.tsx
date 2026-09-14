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
import { ArrowLeft, ArrowUpRight, Eye, Shuffle, User } from 'lucide-react';
import { Box, Button, Flex, Text } from '@backstage/ui';
import type { ParticipantRole } from '@backstage-community/plugin-pointing-poker-common';
import { CharacterAvatar } from './CharacterAvatar';
import type { Character } from './utils/avatar';
import { CHARACTERS, surpriseMe } from './utils/avatar';

type CharacterPickerProps = Readonly<{
  allowRoleChange: boolean;
  initialRole: ParticipantRole;
  joining: boolean;
  onBack: () => void;
  onJoin: (character: Character, role: ParticipantRole) => void;
  profilePicture?: string;
  sessionName: string;
  teamName: string;
  userName: string;
}>;

const ROLE_LABELS: Record<ParticipantRole, string> = {
  host: 'Host',
  observer: 'Observer',
  voter: 'Voter',
};

const isSameCharacter = (a: Character, b: Character): boolean =>
  a.seed === b.seed && a.style === b.style;

export const CharacterPicker = ({
  allowRoleChange,
  initialRole,
  joining,
  onBack,
  onJoin,
  profilePicture,
  sessionName,
  teamName,
  userName,
}: CharacterPickerProps) => {
  const photoCharacter: Character = {
    seed: profilePicture || userName,
    style: 'photo',
  };

  const [selected, setSelected] = useState<Character>(photoCharacter);
  const [role, setRole] = useState<ParticipantRole>(initialRole);

  const handleSurprise = () => {
    setSelected(surpriseMe(selected));
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
      <Button
        iconStart={<ArrowLeft size={16} />}
        onClick={onBack}
        size="small"
        variant="tertiary"
      >
        {`Joining ${sessionName}`}
      </Button>

      <Box style={{ marginTop: 'var(--bui-space-4)' }}>
        <Text as="h2" variant="title-medium" weight="bold">
          Pick your character
        </Text>
      </Box>
      <Text as="p" color="secondary" variant="body-small">
        This is how the rest of the table will see you.
      </Text>

      <Flex
        align="center"
        justify="between"
        style={{
          background: 'var(--bui-bg-neutral-2)',
          borderRadius: 'var(--bui-radius-3)',
          marginTop: 'var(--bui-space-4)',
          padding: 'var(--bui-space-4)',
        }}
      >
        <Flex align="center" gap="4">
          <CharacterAvatar
            name={userName}
            seed={selected.seed}
            size={64}
            style={selected.style}
          />
          <Box>
            <Text as="p" variant="body-large" weight="bold">
              {userName}
            </Text>
            <Text as="p" color="secondary" variant="body-small">
              {`${ROLE_LABELS[role]} · ${teamName}`}
            </Text>
          </Box>
        </Flex>
        <Button
          iconStart={<Shuffle size={16} />}
          onClick={handleSurprise}
          variant="secondary"
        >
          Surprise me
        </Button>
      </Flex>

      {allowRoleChange && (
        <Box style={{ marginTop: 'var(--bui-space-4)' }}>
          <Text as="p" color="secondary" variant="body-x-small" weight="bold">
            Join as
          </Text>
          <Flex gap="2" style={{ marginTop: 'var(--bui-space-2)' }}>
            <Button
              iconStart={<User size={16} />}
              onClick={() => setRole('voter')}
              style={{ flex: 1 }}
              variant={role === 'voter' ? 'primary' : 'secondary'}
            >
              Voter
            </Button>
            <Button
              iconStart={<Eye size={16} />}
              onClick={() => setRole('observer')}
              style={{ flex: 1 }}
              variant={role === 'observer' ? 'primary' : 'secondary'}
            >
              Observer
            </Button>
          </Flex>
        </Box>
      )}

      <Box
        style={{
          display: 'grid',
          gap: 'var(--bui-space-3)',
          gridTemplateColumns: 'repeat(6, 1fr)',
          marginTop: 'var(--bui-space-4)',
        }}
      >
        {[photoCharacter, ...CHARACTERS].map(character => {
          const active = isSameCharacter(character, selected);
          const isPhoto = character.style === 'photo';
          return (
            <button
              key={`${character.style}-${character.seed}`}
              onClick={() => setSelected(character)}
              style={{
                background: 'transparent',
                border: active
                  ? '2px solid var(--bui-fg-primary)'
                  : '2px solid transparent',
                borderRadius: 'var(--bui-radius-3)',
                cursor: 'pointer',
                padding: 'var(--bui-space-1)',
              }}
              title={isPhoto ? 'Your avatar' : undefined}
              type="button"
            >
              <CharacterAvatar
                name={isPhoto ? userName : undefined}
                seed={character.seed}
                size="100%"
                style={character.style}
              />
            </button>
          );
        })}
      </Box>

      <Box style={{ marginTop: 'var(--bui-space-6)' }}>
        <Button
          iconEnd={<ArrowUpRight size={16} />}
          isPending={joining}
          onClick={() => onJoin(selected, role)}
          style={{ width: '100%' }}
          variant="secondary"
        >
          {joining ? 'Joining…' : 'Join session'}
        </Button>
      </Box>
    </Box>
  );
};

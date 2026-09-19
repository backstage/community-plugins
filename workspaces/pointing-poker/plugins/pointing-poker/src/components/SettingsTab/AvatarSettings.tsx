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
import { useAsync } from 'react-use';
import { Shuffle } from 'lucide-react';
import { Box, Button, Card, CardBody, Flex, Text } from '@backstage/ui';
import { useAvatarPref } from '../../hooks/useAvatarPref';
import { CharacterAvatar } from '../LiveSessionTab/CharacterAvatar';
import type { Character } from '../LiveSessionTab/utils/avatar';
import { CHARACTERS, surpriseMe } from '../LiveSessionTab/utils/avatar';
import { useTeamMembers } from '../LiveSessionTab/hooks/useTeamMembers';

const keyOf = (character: Character): string =>
  `${character.style}-${character.seed}`;

export const AvatarSettings = () => {
  const { currentUser } = useTeamMembers('');
  const { getAvatarPref, saveAvatarPref } = useAvatarPref();

  const userId = currentUser?.metadata.name ?? '';
  const userName =
    currentUser?.spec?.profile?.displayName ??
    currentUser?.metadata.name ??
    'You';
  const profilePicture = currentUser?.spec?.profile?.picture;

  const photoCharacter: Character = {
    seed: profilePicture || userName,
    style: 'photo',
  };

  const [selected, setSelected] = useState<Character | null>(null);
  const [savedKey, setSavedKey] = useState<null | string>(null);
  const [saving, setSaving] = useState(false);

  const { loading } = useAsync(async () => {
    if (!userId) {
      return;
    }
    const pref = await getAvatarPref(userId);
    if (pref) {
      const character: Character = {
        seed: pref.avatarSeed,
        style: pref.avatarStyle as Character['style'],
      };
      setSelected(character);
      setSavedKey(keyOf(character));
    }
  }, [userId]);

  useEffect(() => {
    if (!loading && !selected && userId) {
      setSelected(photoCharacter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selected, userId]);

  const handleSave = async () => {
    if (!userId || !selected) {
      return;
    }
    setSaving(true);
    try {
      await saveAvatarPref(userId, {
        avatarSeed: selected.seed,
        avatarStyle: selected.style,
      });
      setSavedKey(keyOf(selected));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !selected) {
    return (
      <Card>
        <CardBody>
          <Text color="secondary">Loading avatar…</Text>
        </CardBody>
      </Card>
    );
  }

  const isSaved = savedKey === keyOf(selected);

  let saveLabel = 'Save avatar';
  if (saving) {
    saveLabel = 'Saving…';
  } else if (isSaved) {
    saveLabel = 'Saved';
  }

  return (
    <Card>
      <CardBody>
        <Flex direction="column" gap="4">
          <Box>
            <Text as="h2" variant="title-medium" weight="bold">
              Avatar
            </Text>
            <Text as="p" color="secondary">
              Pick a default avatar. We'll reuse it every time you join a
              session.
            </Text>
          </Box>

          <Flex
            align="center"
            justify="between"
            p="4"
            style={{
              borderRadius: 'var(--bui-radius-3)',
              background: 'var(--bui-bg-neutral-2)',
            }}
          >
            <Flex align="center" gap="4">
              <CharacterAvatar
                name={userName}
                seed={selected.seed}
                style={selected.style}
                size={80}
              />
              <Box>
                <Text as="div" variant="body-large" weight="bold">
                  {userName}
                </Text>
                <Text as="div" variant="body-small" color="secondary">
                  This is how the rest of the table will see you.
                </Text>
              </Box>
            </Flex>
            <Button
              variant="secondary"
              iconStart={<Shuffle size={16} />}
              onClick={() => setSelected(surpriseMe(selected))}
            >
              Surprise me
            </Button>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
            }}
          >
            {[photoCharacter, ...CHARACTERS].map(character => {
              const active = keyOf(character) === keyOf(selected);
              const isPhoto = character.style === 'photo';
              return (
                <button
                  key={keyOf(character)}
                  type="button"
                  title={isPhoto ? 'Your avatar' : undefined}
                  onClick={() => setSelected(character)}
                  style={{
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 'var(--bui-radius-3)',
                    background: 'transparent',
                    border: active
                      ? '2px solid var(--bui-fg-primary)'
                      : '2px solid var(--bui-border-1)',
                  }}
                >
                  <CharacterAvatar
                    name={isPhoto ? userName : undefined}
                    seed={character.seed}
                    style={character.style}
                    size={80}
                  />
                </button>
              );
            })}
          </Box>

          <Box>
            <Button
              variant="primary"
              isDisabled={saving || isSaved}
              onClick={handleSave}
            >
              {saveLabel}
            </Button>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

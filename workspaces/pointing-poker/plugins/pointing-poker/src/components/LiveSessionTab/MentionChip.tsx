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
import { Copy, Mail } from 'lucide-react';
import type { UserEntity } from '@backstage/catalog-model';
import {
  Box,
  ButtonIcon,
  DialogTrigger,
  Flex,
  Link,
  Popover,
  Text,
} from '@backstage/ui';
import type { ProviderUser } from '@backstage-community/plugin-pointing-poker-common';
import { CharacterAvatar } from './CharacterAvatar';
import { useMentionUser } from './hooks/useMentionUser';

type MentionChipProps = Readonly<{
  accountId?: string;
  text: string;
}>;

const chipStyle = {
  background: 'color-mix(in srgb, var(--bui-bg-info) 22%, transparent)',
  border: 'none',
  borderRadius: 'var(--bui-radius-2)',
  color: 'var(--bui-fg-info)',
  cursor: 'pointer',
  fontWeight: 500,
  padding: '0 var(--bui-space-1)',
} as const;

const teamsLink = (email: string) =>
  `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`;

// The full catalog profile (avatar, contact links), shown when the mentioned
// user matches a Backstage catalog User.
const RichCard = ({ entity }: Readonly<{ entity: UserEntity }>) => {
  const profile = entity.spec?.profile;
  const email = profile?.email ?? '';

  return (
    <Flex direction="column" gap="2" style={{ padding: 'var(--bui-space-4)' }}>
      <Flex align="center" gap="3">
        <CharacterAvatar
          name={profile?.displayName}
          seed={profile?.picture}
          size={48}
          style="photo"
        />
        <Flex direction="column" style={{ minWidth: 0 }}>
          <Link href={`/catalog/default/user/${entity.metadata.name}`}>
            <Text as="span" weight="bold">
              {profile?.displayName}
            </Text>
          </Link>
        </Flex>
      </Flex>

      {email && (
        <Flex align="center" justify="between" gap="4">
          <Flex align="center" gap="2" style={{ minWidth: 0 }}>
            <Mail size={16} style={{ flexShrink: 0 }} />
            <Link href={`mailto:${email}`}>
              <Text
                as="span"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                variant="body-small"
              >
                {email}
              </Text>
            </Link>
          </Flex>
          <ButtonIcon
            aria-label="Copy email"
            icon={<Copy size={16} />}
            onClick={() => void window.navigator.clipboard?.writeText(email)}
            size="small"
            variant="tertiary"
          />
        </Flex>
      )}

      {email && (
        <Flex align="center" gap="2">
          <Mail size={16} />
          <Link href={teamsLink(email)}>MS Teams</Link>
        </Flex>
      )}
    </Flex>
  );
};

// Fallback for users not in the catalog (e.g. external collaborators): just what
// the ticket provider knows about the account.
const MinimalCard = ({ user }: Readonly<{ user: ProviderUser }>) => (
  <Flex direction="column" gap="2" style={{ padding: 'var(--bui-space-4)' }}>
    <Flex align="center" gap="3">
      <CharacterAvatar
        name={user.displayName}
        seed={user.avatarUrl}
        size={36}
        style="photo"
      />
      <Text as="span" weight="bold">
        {user.displayName}
      </Text>
    </Flex>
    {user.email && (
      <>
        <Flex align="center" gap="2" style={{ minWidth: 0 }}>
          <Mail size={16} style={{ flexShrink: 0 }} />
          <Link href={`mailto:${user.email}`}>
            <Text as="span" variant="body-small">
              {user.email}
            </Text>
          </Link>
        </Flex>
        <Flex align="center" gap="2">
          <Mail size={16} />
          <Link href={teamsLink(user.email)}>MS Teams</Link>
        </Flex>
      </>
    )}
  </Flex>
);

export const MentionChip = ({ accountId, text }: MentionChipProps) => {
  const [open, setOpen] = useState(false);
  const { entity, jiraUser, loading } = useMentionUser(accountId, open);

  if (!accountId) {
    return <span style={{ ...chipStyle, cursor: 'default' }}>{text}</span>;
  }

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <button style={chipStyle} type="button">
        {text}
      </button>
      <Popover placement="bottom start">
        {loading && !jiraUser && !entity ? (
          <Text
            as="div"
            color="secondary"
            style={{ padding: 'var(--bui-space-4)' }}
            variant="body-small"
          >
            Loading…
          </Text>
        ) : null}
        {!loading && entity ? <RichCard entity={entity} /> : null}
        {!loading && !entity && jiraUser ? (
          <MinimalCard user={jiraUser} />
        ) : null}
        {!loading && !entity && !jiraUser ? (
          <Box style={{ padding: 'var(--bui-space-4)' }}>
            <Text as="span" color="secondary" variant="body-small">
              {text}
            </Text>
          </Box>
        ) : null}
      </Popover>
    </DialogTrigger>
  );
};

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
import type { CSSProperties } from 'react';
import { Eye } from 'lucide-react';
import { Box, Flex, Text } from '@backstage/ui';
import { CharacterAvatar } from './CharacterAvatar';
import type { TableParticipant } from './types';

type WatchingListProps = Readonly<{
  className?: string;
  observers: ReadonlyArray<TableParticipant>;
  style?: CSSProperties;
}>;

const MAX_VISIBLE = 6;

export const WatchingList = ({
  className,
  observers,
  style,
}: WatchingListProps) => {
  if (observers.length === 0) {
    return null;
  }

  const visible = observers.slice(0, MAX_VISIBLE);
  const hiddenCount = observers.length - visible.length;

  return (
    <Box
      className={className}
      style={{
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderRadius: 'var(--bui-radius-3)',
        padding: 'var(--bui-space-3)',
        ...style,
      }}
    >
      <Flex
        align="center"
        gap="1"
        style={{ marginBottom: 'var(--bui-space-2)' }}
      >
        <Eye size={16} style={{ color: 'var(--bui-fg-secondary)' }} />
        <Text as="h3" variant="body-small" weight="bold">
          Watching
        </Text>
        <Text variant="body-small" color="secondary">
          {`· ${observers.length}`}
        </Text>
      </Flex>
      <Box
        as="ul"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {visible.map(observer => (
          <Box
            as="li"
            key={observer.userId}
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 8,
              padding: '4px 6px',
            }}
          >
            <CharacterAvatar
              name={observer.userName}
              seed={observer.avatarSeed}
              size={32}
              style={observer.avatarStyle}
            />
            <Text
              variant="body-small"
              truncate
              style={{ minWidth: 0, flex: 1 }}
            >
              {observer.userName.split(' ')[0]}
            </Text>
          </Box>
        ))}
        {hiddenCount > 0 && (
          <Box
            as="li"
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 8,
              padding: '4px 6px',
            }}
          >
            <Box
              style={{
                alignItems: 'center',
                background: 'var(--bui-bg-neutral-2)',
                borderRadius: 'var(--bui-radius-full)',
                color: 'var(--bui-fg-secondary)',
                display: 'flex',
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 600,
                height: 32,
                justifyContent: 'center',
                width: 32,
              }}
            >
              {`+${hiddenCount}`}
            </Box>
            <Text variant="body-small" color="secondary">
              more
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

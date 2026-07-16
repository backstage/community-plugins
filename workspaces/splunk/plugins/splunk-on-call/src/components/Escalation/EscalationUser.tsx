/*
 * Copyright 2020 The Backstage Authors
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
import { Flex, Text, ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiMailLine } from '@remixicon/react';
import styles from './EscalationUser.module.css';
import { User } from '../types';

type Props = {
  user: User;
};

export const EscalationUser = ({ user }: Props) => {
  const getUserDisplayName = () => {
    if (user.displayName) return user.displayName;
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return 'User';
  };

  const handleEmailClick = () => {
    if (user.email) {
      window.location.href = `mailto:${user.email}`;
    }
  };

  return (
    <Flex
      align="center"
      style={{
        paddingBottom: 'var(--bui-space-2)',
        paddingTop: 'var(--bui-space-2)',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--bui-bg-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 'var(--bui-space-2)',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {getUserDisplayName()?.charAt(0).toUpperCase()}
      </div>
      <Flex direction="column" style={{ flex: 1 }}>
        <Text className={styles.listItemPrimary}>{getUserDisplayName()}</Text>
        {user.email && (
          <Text variant="body-small" color="secondary">
            {user.email}
          </Text>
        )}
      </Flex>
      {user.email && (
        <TooltipTrigger>
          <ButtonIcon
            variant="secondary"
            icon={<RiMailLine size={16} />}
            aria-label="email"
            onClick={handleEmailClick}
          />
          <Tooltip>Send email to {getUserDisplayName()}</Tooltip>
        </TooltipTrigger>
      )}
    </Flex>
  );
};

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

import { Box, Text } from '@backstage/ui';
import { EscalationUsersEmptyState } from './EscalationUsersEmptyState';
import { EscalationUser } from './EscalationUser';
import useAsync from 'react-use/esm/useAsync';
import { splunkOnCallApiRef } from '../../api';
import { User } from '../types';
import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import styles from './EscalationPolicy.module.css';

type Props = {
  users: { [key: string]: User };
  team: string;
};

export const EscalationPolicy = ({ users, team }: Props) => {
  const api = useApi(splunkOnCallApiRef);

  const {
    value: userNames,
    loading,
    error,
  } = useAsync(async () => {
    const oncalls = await api.getOnCallUsers();
    const teamUsernames = oncalls
      .filter(oncall => oncall.team?.name === team)
      .flatMap(oncall => {
        return oncall.oncallNow?.flatMap(oncallNow => {
          return oncallNow.users?.flatMap(user => {
            return user?.onCalluser?.username;
          });
        });
      });
    return teamUsernames;
  });

  if (error) {
    return (
      <Box>
        <Text>
          Error encountered while fetching information. {error.message}
        </Text>
      </Box>
    );
  }

  if (!loading && !userNames?.length) {
    return <EscalationUsersEmptyState />;
  }

  return (
    <Box className={styles.root}>
      {!loading && <div className={styles.header}>ON CALL</div>}
      {loading ? (
        <Progress style={{ margin: 'var(--bui-space-4)' }} />
      ) : (
        userNames &&
        userNames.map(
          (userName, index) =>
            userName &&
            userName in users && (
              <EscalationUser key={index} user={users[userName]} />
            ),
        )
      )}
    </Box>
  );
};

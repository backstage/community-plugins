/*
 * Copyright 2022 The Backstage Authors
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
import { FunctionComponent } from 'react';
import { Text, Flex, Avatar } from '@backstage/ui';
import styles from './UserHeader.module.css';

type Props = {
  name: string;
  avatar?: string;
};

const UserHeader: FunctionComponent<Props> = (props: Props) => {
  const { name, avatar } = props;

  return (
    <Flex
      align="center"
      style={{
        marginLeft: 'var(--bui-space-2)',
        marginRight: 'var(--bui-space-2)',
      }}
    >
      <Text variant="body-small" color="secondary">
        {name}
      </Text>
      <Avatar src={avatar ?? ''} name={name} className={styles.small} />
    </Flex>
  );
};

export default UserHeader;

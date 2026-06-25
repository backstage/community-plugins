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

import { Text, Flex, Avatar } from '@backstage/ui';
import styles from './Assignees.module.css';

type AssigneesProps = {
  name?: string;
  avatar?: string;
};

export const Assignees = (props: AssigneesProps) => {
  const { name, avatar } = props;

  // todo: many assignees -> NUM assignees + stock images on each other
  return name ? (
    <Flex align="center" mx="2">
      <Text variant="body-small" color="primary">
        {name}
      </Text>
      <Avatar src={avatar ?? ''} name={name} className={styles.small} />
    </Flex>
  ) : (
    <Flex align="center" mx="2">
      <Text variant="body-small" color="primary" className={styles.noAssignees}>
        No assignees
      </Text>
    </Flex>
  );
};

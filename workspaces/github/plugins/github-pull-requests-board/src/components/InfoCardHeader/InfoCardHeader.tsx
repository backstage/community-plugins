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
import { PropsWithChildren, FunctionComponent } from 'react';
import { Text, Flex, ButtonIcon } from '@backstage/ui';
import { RiRefreshLine } from '@remixicon/react';

type Props = {
  onRefresh: () => void;
};

const InfoCardHeader: FunctionComponent<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>,
) => {
  const { children, onRefresh } = props;

  return (
    <Flex justify="between" align="center">
      <Flex align="center">
        <Text variant="title-medium">Open pull requests</Text>
        <ButtonIcon
          aria-label="Refresh"
          onPress={onRefresh}
          icon={<RiRefreshLine size={20} />}
          variant="secondary"
        />
      </Flex>
      {children}
    </Flex>
  );
};

export default InfoCardHeader;

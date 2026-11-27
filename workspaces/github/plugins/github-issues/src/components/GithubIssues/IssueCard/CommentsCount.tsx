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

import { useApiHolder } from '@backstage/core-plugin-api';
import { coreApis } from '@backstage/frontend-plugin-api';
import { Flex } from '@backstage/ui';
import { RiChat1Line } from '@remixicon/react';
import Badge from '@material-ui/core/Badge';

type CommentsCountProps = {
  commentsCount: number;
};

export const CommentsCount = (props: CommentsCountProps) => {
  const { commentsCount } = props;
  const chatIcon = useApiHolder().get(coreApis.icons)?.icon('chat') ?? (
    <RiChat1Line />
  );

  return (
    <Flex mb="2" mr="3" justify="start" style={{ alignSelf: 'flex-end' }}>
      <Badge badgeContent={commentsCount} color="primary">
        {chatIcon}
      </Badge>
    </Flex>
  );
};

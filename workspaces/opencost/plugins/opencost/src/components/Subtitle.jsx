/*
 * Copyright 2023 The Backstage Authors
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

import { memo } from 'react';
import { Box, Text } from '@backstage/ui';
import { upperFirst } from 'lodash';
import { toVerboseTimeRange } from '../util';

const Subtitle = ({ report }) => {
  const { aggregateBy, window } = report;

  return (
    <Box mb="1">
      {aggregateBy && aggregateBy.length > 0 ? (
        <Text variant="body-medium">
          {toVerboseTimeRange(window)} by {upperFirst(aggregateBy)}
        </Text>
      ) : (
        <Text variant="body-medium">{toVerboseTimeRange(window)}</Text>
      )}
    </Box>
  );
};

export default memo(Subtitle);

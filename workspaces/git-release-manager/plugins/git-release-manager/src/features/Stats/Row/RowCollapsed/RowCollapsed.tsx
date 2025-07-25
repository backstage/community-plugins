/*
 * Copyright 2021 The Backstage Authors
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
import { Box } from '@material-ui/core';

import { ReleaseStats } from '../../contexts/ReleaseStatsContext';
import { ReleaseTagList } from './ReleaseTagList';
import { ReleaseTime } from './ReleaseTime';

interface RowCollapsedProps {
  releaseStat: ReleaseStats['releases']['0'];
}

export function RowCollapsed({ releaseStat }: RowCollapsedProps) {
  return (
    <Box
      margin={1}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        paddingLeft: '10%',
        paddingRight: '10%',
      }}
    >
      <ReleaseTagList releaseStat={releaseStat} />

      <ReleaseTime releaseStat={releaseStat} />
    </Box>
  );
}

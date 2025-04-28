/*
 * Copyright 2024 The Backstage Authors
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
import type { FC } from 'react';

import { Fragment } from 'react';
import { Box, CircularProgress } from '@material-ui/core';

export const EmptyStateSpinner: FC = () => {
  return (
    <Fragment>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          margin: '5rem 0 5rem 0',
        }}
      >
        <CircularProgress data-testid="spinner" />
      </Box>
    </Fragment>
  );
};

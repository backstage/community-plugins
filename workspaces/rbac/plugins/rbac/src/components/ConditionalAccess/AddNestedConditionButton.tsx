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
import React from 'react';

import { Box, Typography } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

export const AddNestedConditionButton = () => {
  const tooltipTitle = () => (
    <div>
      <Typography variant="body1" component="p" align="center">
        Nested conditions are <b>1 layer rules within a main condition</b>. It
        lets you allow appropriate access by using detailed permissions based on
        various conditions. You can add multiple nested conditions.
      </Typography>
      <Typography variant="body1" component="p" align="center">
        For example, you can allow access to all entity types in the main
        condition and use a nested condition to limit the access to entities
        owned by the user.
      </Typography>
    </div>
  );
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="body1" component="span">
        Add Nested Condition
      </Typography>
      <Tooltip title={tooltipTitle()} placement="top">
        <HelpOutlineIcon fontSize="inherit" style={{ marginLeft: '0.25rem' }} />
      </Tooltip>
    </Box>
  );
};

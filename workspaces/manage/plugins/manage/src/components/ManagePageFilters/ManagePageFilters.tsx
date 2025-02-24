/*
 * Copyright 2025 The Backstage Authors
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
import React, { useCallback } from 'react';

import { makeStyles } from '@mui/styles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { useManagePageCombined } from './useFilters';

const useStyles = makeStyles(theme => ({
  label: {
    color: theme.page.fontColor,
    userSelect: 'none',
  },
}));

export function ManagePageFilters() {
  const { label } = useStyles();
  const [combined, setCombined] = useManagePageCombined();

  const handleChange = useCallback(
    (_event: unknown, checked: boolean) => {
      setCombined(checked);
    },
    [setCombined],
  );

  return (
    <FormGroup row>
      <FormControlLabel
        control={
          <Switch
            checked={combined ?? false}
            onChange={handleChange}
            name="manage-page-combined"
            color="primary"
          />
        }
        label={<Typography className={label}>Combine entities</Typography>}
      />
    </FormGroup>
  );
}

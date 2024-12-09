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
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { useComboBoxStyles } from './useComboBoxStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';

const FixedWidthFormControlLabel = withStyles(
  _theme => ({
    label: {
      width: '100%',
    },
    root: {
      width: '90%',
    },
  }),
  { name: 'FixedWidthFormControlLabel' },
)(FormControlLabel);

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export type RenderOptionLabelProps = {
  isSelected: boolean;
  title: string;
};

export function RenderOptionLabel(props: RenderOptionLabelProps) {
  const classes = useComboBoxStyles();
  return (
    <Box className={classes.fullWidth}>
      <FixedWidthFormControlLabel
        className={classes.fullWidth}
        control={
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            checked={props.isSelected}
          />
        }
        onClick={event => event.preventDefault()}
        label={
          <Tooltip title={props.title}>
            <Box display="flex" alignItems="center">
              <Box className={classes.boxLabel}>
                <Typography noWrap>{props.title}</Typography>
              </Box>
            </Box>
          </Tooltip>
        }
      />
    </Box>
  );
}

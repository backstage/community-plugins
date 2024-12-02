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
import {
  TableCell,
  TableRow,
  Theme,
  Typography,
  makeStyles,
} from '@material-ui/core';
import AngleDoubleDownIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import AngleDoubleUpIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import { t_color_yellow_40 as moderateColor } from '@patternfly/react-tokens';
import { t_color_orange_40 as importantColor } from '@patternfly/react-tokens';
import { t_color_blue_20 as minorColor } from '@patternfly/react-tokens';
import { CriticalRiskIcon } from '../Icons/CriticalIcon';
import { EqualsIcon } from '../Icons/EqualsIcon';
import { PipelineRunTableRowActions } from './PipelineRunTableRowActions';
import { PipelineRunResult } from '../../models/pipelineRunResult';
import { PipelineRunSBOMLink } from './PipelineRunSBOMLink';
import { IconWithValue } from '../Icons/IconWithValue';

type PipelineRunTableRowProps = {
  index: number;
  pr: PipelineRunResult;
};

const useStyles = makeStyles((theme: Theme) => ({
  row: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.paper,
    },
  },
  criticalIcon: {
    height: '1em',
    width: '1em',
  },
  importantIcon: {
    fill: importantColor.value,
    height: '0.8em',
    width: '0.8em',
  },
  moderateIcon: {
    fill: moderateColor.value,
    height: '1em',
    width: '1em',
  },
  lowIcon: {
    fill: minorColor.value,
    height: '0.8em',
    width: '0.8em',
    marginLeft: '-0.2em',
  },
}));

export const PipelineRunTableRow: React.FC<PipelineRunTableRowProps> = ({
  index,
  pr,
}) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <TableRow key={index} className={classes.row}>
        <TableCell align="left">
          <Typography variant="body2">{pr.id}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{pr.type}</Typography>
        </TableCell>
        <TableCell>
          <IconWithValue
            tooltip="Critical"
            iconComponent={CriticalRiskIcon}
            iconProps={{ className: classes.criticalIcon }}
            value={pr.critical}
          />
        </TableCell>
        <TableCell>
          <IconWithValue
            tooltip="Important"
            iconComponent={AngleDoubleUpIcon}
            iconProps={{ className: classes.importantIcon }}
            value={pr.important}
          />
        </TableCell>
        <TableCell>
          <IconWithValue
            tooltip="Moderate"
            iconComponent={EqualsIcon}
            iconProps={{ className: classes.moderateIcon }}
            value={pr.moderate}
          />
        </TableCell>
        <TableCell>
          <IconWithValue
            tooltip="Low"
            iconComponent={AngleDoubleDownIcon}
            iconProps={{ className: classes.lowIcon }}
            value={pr.low}
          />
        </TableCell>
        <TableCell>
          <PipelineRunSBOMLink pr={pr} />
        </TableCell>
        <TableCell>
          <PipelineRunTableRowActions pr={pr} />
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

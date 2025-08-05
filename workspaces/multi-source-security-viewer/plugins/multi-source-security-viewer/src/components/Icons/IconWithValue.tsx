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
import type { ComponentType, FC } from 'react';

import { Fragment } from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { isNumber } from 'lodash';
import Tooltip from '@mui/material/Tooltip';
import { Box, Typography } from '@material-ui/core';

type PipelineRunIconProps = {
  iconComponent: ComponentType;
  tooltip: string;
  iconProps?: SvgIconProps;
  value: string | number; // if value is a number, it will be displayed with the icon
};

export interface IconWithValueProps
  extends Omit<PipelineRunIconProps, 'iconComponent'> {}

export const IconWithValue: FC<PipelineRunIconProps> = ({
  iconComponent: IconComponent,
  tooltip,
  iconProps,
  value,
}) => {
  return (
    <Fragment>
      <Tooltip title={tooltip} arrow placement="left">
        <Box display="flex" alignItems="center" style={{ gap: '.5em' }}>
          {isNumber(value) ? (
            <>
              <IconComponent {...iconProps} /> {value}
            </>
          ) : (
            <Typography variant="body2">{value}</Typography>
          )}
        </Box>
      </Tooltip>
    </Fragment>
  );
};

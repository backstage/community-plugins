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
import { Typography, Tooltip } from '@material-ui/core';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import { FlexItem } from '@patternfly/react-core';
import type { ReactNode, FC } from 'react';
import { HTMLAttributes } from 'react';

interface MetadataItemWithTooltipProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  tooltipText: string;
  children: ReactNode;
}

const MetadataItemWithTooltip: FC<MetadataItemWithTooltipProps> = ({
  title,
  tooltipText,
  children,
  ...props
}) => {
  return (
    <FlexItem {...props}>
      <Typography variant="body1" color="textPrimary">
        <>
          {title}
          <Tooltip
            placement="top"
            disableFocusListener
            disableTouchListener
            title={tooltipText}
          >
            <IconButton>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </>
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {children}
      </Typography>
    </FlexItem>
  );
};

export default MetadataItemWithTooltip;

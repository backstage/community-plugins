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

import { Chip, Typography } from '@material-ui/core';
import { DoveIcon } from '@patternfly/react-icons';
import SearchIcon from '@mui/icons-material/Search';
import { StatusOK } from '@backstage/core-components';

const RevisionType: React.FC<{ label: string }> = ({ label }) => {
  const iconStyle = {
    marginLeft: '4.8px',
    marginBottom: '8px',
    marginRight: '5px',
    width: '0.8em',
    height: '1em',
  };

  const pfIconStyle = {
    marginLeft: '5px',
    marginRight: '3px',
    width: '1em',
    height: '1em',
  };

  if (label === 'Stable' || label === 'Active') {
    return (
      <>
        <Chip
          variant="outlined"
          size="small"
          color="default"
          icon={
            <Typography style={iconStyle}>
              <StatusOK />
            </Typography>
          }
          label={label}
        />
      </>
    );
  }

  if (label === 'Canary') {
    return (
      <Chip
        variant="outlined"
        size="small"
        icon={<DoveIcon style={{ ...pfIconStyle, fill: '#e4aa37' }} />}
        label={label}
      />
    );
  }

  return (
    <Chip
      variant="outlined"
      size="small"
      color="default"
      icon={<SearchIcon style={{ fill: 'gray' }} />}
      label={label}
    />
  );
};
export default RevisionType;

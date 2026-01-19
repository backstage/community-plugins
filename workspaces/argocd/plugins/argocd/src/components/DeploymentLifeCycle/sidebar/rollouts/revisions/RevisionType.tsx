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

import { Chip } from '@material-ui/core';
import {
  CheckCircleIcon,
  DoveIcon,
  OutlinedCheckCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';

const RevisionType: FC<{ label: string }> = ({ label }) => {
  const iconStyle = {
    marginLeft: '10px',
    width: '1em',
    height: '1em',
  };

  if (label === 'Stable') {
    return (
      <Chip
        variant="outlined"
        size="small"
        color="default"
        icon={<CheckCircleIcon style={{ ...iconStyle, fill: 'green' }} />}
        label={label}
      />
    );
  }

  if (label === 'Active') {
    return (
      <Chip
        variant="outlined"
        size="small"
        color="default"
        icon={
          <OutlinedCheckCircleIcon style={{ ...iconStyle, fill: 'green' }} />
        }
        label={label}
      />
    );
  }

  if (label === 'Canary') {
    return (
      <Chip
        variant="outlined"
        size="small"
        icon={<DoveIcon style={{ ...iconStyle, fill: '#e4aa37' }} />}
        label={label}
      />
    );
  }

  return (
    <Chip
      variant="outlined"
      size="small"
      color="default"
      icon={<SearchIcon style={{ ...iconStyle, fill: 'gray' }} />}
      label={label}
    />
  );
};
export default RevisionType;

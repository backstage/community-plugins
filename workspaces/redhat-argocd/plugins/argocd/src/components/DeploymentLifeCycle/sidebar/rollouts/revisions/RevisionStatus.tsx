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
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { Typography } from '@material-ui/core';
import { StatusOK, StatusRunning } from '@backstage/core-components';
import useIconStyles from '../../../../../hooks/useIconStyles';
import { ReplicaSet } from '../../../../../types/resources';

interface RevisionStatusProps {
  revision: ReplicaSet;
}

const RevisionStatus: React.FC<RevisionStatusProps> = ({ revision }) => {
  const classes = useIconStyles();
  const iconStyle = {
    marginLeft: '4.8px',
    marginBottom: '5px',
    marginRight: '8px',
    width: '0.8em',
  };

  const replicas = revision?.status?.replicas || 0;
  const availableReplicas = revision?.status?.availableReplicas || 0;

  if (!!revision && replicas === 0) {
    return (
      <ArrowCircleDownIcon
        className={classes.icon}
        style={{ fill: '#fd8a5f' }}
      />
    );
  }
  if (!!revision && availableReplicas < replicas) {
    return (
      <Typography style={iconStyle}>
        <StatusRunning />
      </Typography>
    );
  }
  if (!!revision && availableReplicas === replicas) {
    return (
      <Typography style={iconStyle}>
        <StatusOK />
      </Typography>
    );
  }
  return null;
};
export default RevisionStatus;

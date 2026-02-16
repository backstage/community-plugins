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

import {
  ArrowCircleDownIcon,
  CheckCircleIcon,
  CircleNotchIcon,
} from '@patternfly/react-icons';

import useIconStyles from '../../../../../hooks/useIconStyles';
import { ReplicaSet } from '../../../../../types/resources';

interface RevisionStatusProps {
  revision: ReplicaSet;
}

const RevisionStatus: FC<RevisionStatusProps> = ({ revision }) => {
  const classes = useIconStyles();

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
      <CircleNotchIcon
        className={`${classes.icon} ${classes['icon-spin']}`}
        style={{ fill: '#0DADEA' }}
      />
    );
  }
  if (!!revision && availableReplicas === replicas) {
    return (
      <CheckCircleIcon className={classes.icon} style={{ fill: 'green' }} />
    );
  }
  return null;
};
export default RevisionStatus;

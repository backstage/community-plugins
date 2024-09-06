import React from 'react';

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

const RevisionStatus: React.FC<RevisionStatusProps> = ({ revision }) => {
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

import React from 'react';

import { Chip } from '@material-ui/core';
import {
  CheckCircleIcon,
  DoveIcon,
  OutlinedCheckCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';

const RevisionType: React.FC<{ label: string }> = ({ label }) => {
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

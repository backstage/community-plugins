import React from 'react';

import { Chip, Typography } from '@material-ui/core';
import { Flex, FlexItem } from '@patternfly/react-core';

import { Application } from '../../types';

const AppNamespace: React.FC<{ app: Application }> = ({ app }) => {
  if (!app) {
    return null;
  }
  return (
    <Flex
      gap={{ default: 'gapNone' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
    >
      <FlexItem>
        <Chip
          size="small"
          variant="default"
          color="primary"
          label="NS"
          style={{ background: 'green' }}
        />
      </FlexItem>
      <FlexItem>
        <Typography variant="body2" color="textSecondary">
          {app.spec.destination.namespace}{' '}
        </Typography>
      </FlexItem>
    </Flex>
  );
};

export default AppNamespace;

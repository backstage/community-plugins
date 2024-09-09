import { Typography } from '@material-ui/core';
import { FlexItem } from '@patternfly/react-core';
import * as React from 'react';
import { HTMLAttributes } from 'react';

interface MetadataItemProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
}

const MetadataItem: React.FC<MetadataItemProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <FlexItem {...props}>
      <Typography variant="body1" color="textPrimary">
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {children}
      </Typography>
    </FlexItem>
  );
};

export default MetadataItem;

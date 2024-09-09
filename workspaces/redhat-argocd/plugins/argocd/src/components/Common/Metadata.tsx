import React, { HTMLAttributes, ReactElement } from 'react';
import MetadataItem from './MetadataItem';
import { Typography } from '@material-ui/core';
import { Flex, FlexProps } from '@patternfly/react-core';

type MetadataProps = {
  children:
    | ReactElement<typeof MetadataItem>
    | ReactElement<typeof MetadataItem>[];
  direction?: FlexProps['direction'];
  gap?: FlexProps['gap'];
} & HTMLAttributes<HTMLDivElement>;

const Metadata: React.FC<MetadataProps> = ({
  children,
  direction,
  gap = { sm: 'gap3xl' },
  ...props
}) => {
  return (
    <Typography variant="h6" gutterBottom component="div">
      <Flex direction={direction} gap={gap} {...props}>
        {children}
      </Flex>
    </Typography>
  );
};

export default Metadata;

import * as React from 'react';

import { Box, Chip, makeStyles } from '@material-ui/core';

const useLocalStyles = makeStyles({
  chip: {
    margin: 0,
    marginRight: '.2em',
    height: '1.5em',
    '& > span': {
      padding: '.3em',
    },
  },
});

type ManifestDigestChipProps = {
  label: string;
  hash: string;
};

export const ManifestDigestChip = ({
  label,
  hash,
}: ManifestDigestChipProps) => {
  const localClasses = useLocalStyles();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Chip label={label} className={localClasses.chip} />
      {hash}
    </Box>
  );
};

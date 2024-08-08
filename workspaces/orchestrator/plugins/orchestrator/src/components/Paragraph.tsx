import React, { PropsWithChildren } from 'react';

import Typography from '@mui/material/Typography';

export const Paragraph = (props: PropsWithChildren<{}>) => {
  return (
    <Typography
      style={{ marginTop: '14px', marginBottom: '14px' }}
      variant="body2"
      component="p"
    >
      {props.children}
    </Typography>
  );
};

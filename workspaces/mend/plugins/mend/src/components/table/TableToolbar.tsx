import type { ReactNode } from 'react';
import { MTableToolbar } from '@material-table/core';
import { Grid, Typography } from '@material-ui/core';

type TableToolbarProps = {
  children: ReactNode;
  title?: string;
  toolbar: any; // Allow any object structure here
};

export const TableToolbar = ({
  toolbar,
  children,
  title,
}: TableToolbarProps) => {
  return (
    <Grid container alignItems="center" alignContent="center">
      <Grid item xs={6}>
        {title && <Typography variant="h4">{title}</Typography>}
      </Grid>
      <Grid item xs={6}>
        <MTableToolbar {...toolbar} />
      </Grid>
      <Grid item xs={12}>
        {children}
      </Grid>
    </Grid>
  );
};

import type { ReactNode } from 'react';
import { MTableToolbar } from '@material-table/core';
import { Grid, Typography } from '@material-ui/core';

type TableToolbarProps = {
  children: ReactNode;
  ProjectFilterComponent: React.FC;
  title?: string;
  toolbar: any; // Allow any object structure here
};

export const TableToolbar = ({
  toolbar,
  ProjectFilterComponent,
  children,
  title,
}: TableToolbarProps) => {
  return (
    <Grid container alignItems="center" alignContent="center">
      <Grid item xs={12}>
        {title && <Typography variant="h4">{title}</Typography>}
      </Grid>
      <Grid
        container
        item
        xs={12}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={9}>
          <ProjectFilterComponent />
        </Grid>
        <Grid item xs={3}>
          <MTableToolbar {...toolbar} />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {children}
      </Grid>
    </Grid>
  );
};

/** Adapted from https://github.com/backstage/backstage/blob/c780320418b7775f18fc0d2cc279ee7db9c7cb25/plugins/catalog-react/src/components/CatalogFilterLayout/CatalogFilterLayout.tsx */

import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Theme, useTheme } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';

export function Filters(props: {
  children: React.ReactNode;
  options?: {
    drawerBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    drawerAnchor?: 'left' | 'right' | 'top' | 'bottom';
  };
}) {
  const isScreenSmallerThanBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(props.options?.drawerBreakpoint ?? 'md'),
  );
  const theme = useTheme();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  return isScreenSmallerThanBreakpoint ? (
    <>
      <Button
        style={{ marginTop: theme.spacing(1), marginLeft: theme.spacing(1) }}
        onClick={() => setFilterDrawerOpen(true)}
        startIcon={<FilterListIcon />}
      >
        Filters
      </Button>
      <Drawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        anchor={props.options?.drawerAnchor ?? 'left'}
        disableAutoFocus
        keepMounted
        variant="temporary"
      >
        <Box m={2}>
          <Typography
            variant="h6"
            component="h2"
            style={{ marginBottom: theme.spacing(1) }}
          >
            Filters
          </Typography>
          {props.children}
        </Box>
      </Drawer>
    </>
  ) : (
    <Grid item lg={2}>
      {props.children}
    </Grid>
  );
}

export function Table(props: { children: React.ReactNode }) {
  return (
    <Grid item xs={12} lg={10}>
      {props.children}
    </Grid>
  );
}

export function IndexPageLayout(props: { children: React.ReactNode }) {
  return (
    <Grid container style={{ position: 'relative' }}>
      {props.children}
    </Grid>
  );
}

IndexPageLayout.Filters = Filters;
IndexPageLayout.Table = Table;

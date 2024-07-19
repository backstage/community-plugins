import { Box, makeStyles } from '@material-ui/core';
import React from 'react';
import { BACKSTAGE_HEADER_HEIGHT } from '../App';
import Logo from './Logo/Logo';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    height: BACKSTAGE_HEADER_HEIGHT,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0, 2),
    backgroundColor: theme.palette.background.paper,
    zIndex: 1101, // Random zIndex that beats the sidebar 🙄
  },
}));

export default function AppHeader() {
  const classes = useStyles();

  return <Box className={classes.root}>{<Logo />}</Box>;
}

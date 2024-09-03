import React, { useState } from 'react';
import {
  createStyles,
  IconButton,
  Menu,
  MenuItem,
  makeStyles,
  Theme,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionButton: {
      color: theme.palette.grey[700],
    },
    menuPaper: {
      borderRadius: '4px',
      minWidth: '14rem',
      padding: theme.spacing(0),
      top: theme.spacing(1),
    },
    menuItem: {
      color: theme.palette.grey[800],
      padding: theme.spacing(1, 2),
    },
  }),
);

export const ResourcesKebabMenuOptions = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls="kebab-menu"
        aria-haspopup="true"
        onClick={handleClick}
        className={classes.actionButton}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="kebab-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{ paper: classes.menuPaper }}
        transformOrigin={{
          vertical: -40,
          horizontal: 220,
        }}
      >
        <MenuItem onClick={handleClose} className={classes.menuItem}>
          Refresh
        </MenuItem>
        <MenuItem onClick={handleClose} className={classes.menuItem}>
          Sync
        </MenuItem>
      </Menu>
    </>
  );
};

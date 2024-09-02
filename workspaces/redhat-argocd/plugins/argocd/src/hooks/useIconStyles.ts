import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useIconStyles = makeStyles<Theme>(theme =>
  createStyles({
    icon: {
      marginLeft: theme.spacing(0.6),
      width: '1em',
      height: '1em',
    },
    'icon-spin': {
      animation: '$spin-animation 0.5s infinite',
      display: 'inline-block',
    },

    '@keyframes spin-animation': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(359deg)',
      },
    },
  }),
);

export default useIconStyles;

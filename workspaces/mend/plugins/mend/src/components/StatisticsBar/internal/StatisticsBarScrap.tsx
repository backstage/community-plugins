import { ReactElement } from 'react';
import type { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { numberToShortText } from '../../../utils';
import { StatisticsBarScrapProps } from '../statisticsBar.types';
import { linearGradient } from '../statisticsBar.helpers';

const useStyles = makeStyles<Theme, { color: string; isHovered: boolean }>(
  () => ({
    scrapContainer: {
      display: 'flex',
      justifyContent: 'between',
      width: 'auto',
      gap: '0.3rem',
      rowGap: '0.5rem',
    },
    scrapContent: {
      height: '20px',
      width: '20px',
      borderRadius: '3px',
      backgroundColor: ({ color }) => color,
      alignItems: 'center',
      backgroundSize: '6px 6px',
      flexShrink: 0,
      backgroundImage: ({ isHovered }: { isHovered: boolean }): string =>
        isHovered ? linearGradient : '',
      cursor: ({ isHovered }: { isHovered: boolean }): string =>
        isHovered ? 'pointer' : '',
      '&:hover': {
        backgroundImage: ({ isHovered }: { isHovered: boolean }): string =>
          isHovered ? linearGradient : '',
        cursor: ({ isHovered }: { isHovered: boolean }): string =>
          isHovered ? 'pointer' : '',
      },
    },
    scrapLabel: {
      display: 'flex',
      width: '100%',
      gap: '0.3rem',
      textTransform: 'capitalize',
      alignItems: 'center',
      paddingRight: '16px',
    },
    scrapName: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block',
    },
    amount: {
      fontWeight: 500,
    },
  }),
);

export const StatisticsBarScrap = ({
  color,
  value,
  name,
  onHover,
  isHovered,
  onLeave,
}: StatisticsBarScrapProps): ReactElement => {
  const classes = useStyles({
    isHovered,
    color,
  });
  return (
    <div className={classes.scrapContainer}>
      <div
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className={classes.scrapContent}
      />
      <span
        className={`${classes.scrapLabel} MuiTypography-root MuiTypography-body1`}
      >
        <span className={classes.scrapName}>{name}</span>
        <span className={classes.amount}>{numberToShortText(value)}</span>
      </span>
    </div>
  );
};

import { makeStyles, Tooltip, Theme } from '@material-ui/core';
import { StatisticsBarSegmentProps } from '../statisticsBar.types';
import { linearGradient } from '../statisticsBar.helpers';

const useStyles = makeStyles<
  Theme,
  { percentage: number; color?: string; isHovered: boolean }
>(theme => ({
  segment: {
    height: '36px',
    backgroundSize: '10px 10px',
    width: ({ percentage }) => `${percentage}%`,
    backgroundColor: ({ color }) => {
      if (color) return color;
      return theme.palette.type === 'light'
        ? '#F5F6F8'
        : theme.palette.background.default;
    },
    backgroundImage: ({ isHovered }: { isHovered: boolean }) =>
      isHovered ? linearGradient : '',
    cursor: ({ isHovered }: { isHovered: boolean }) =>
      isHovered ? 'pointer' : '',
    '&:hover': {
      backgroundImage: ({ isHovered }: { isHovered: boolean }) =>
        isHovered ? linearGradient : '',
      cursor: ({ isHovered }: { isHovered: boolean }) =>
        isHovered ? 'pointer' : '',
    },
  },
  tooltipContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const StatisticsBarSegment = ({
  percentage,
  color = '',
  onHover,
  isHovered,
  onLeave,
  tooltipContent = null,
}: StatisticsBarSegmentProps) => {
  const classes = useStyles({
    isHovered,
    color,
    percentage,
  });

  return tooltipContent ? (
    <Tooltip title={tooltipContent} arrow placement="top">
      <div
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className={classes.segment}
      />
    </Tooltip>
  ) : (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={classes.segment}
    />
  );
};

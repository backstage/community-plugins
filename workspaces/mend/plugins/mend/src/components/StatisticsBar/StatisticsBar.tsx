import { ReactElement, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { StatisticsBarScrap } from './internal/StatisticsBarScrap';
import { StatisticsBarSegment } from './internal/StatisticsBarSegment';
import { StatisticsBarProps } from './statisticsBar.types';
import {
  getTotalFindings,
  getTotalFindingsByEngine,
} from './statisticsBar.helpers';

const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '4px',
    border: '1px solid #dfdfdf',
  },
  header: {
    padding: '1rem',
    fontSize: '16px',
    fontWeight: 600,
  },
  content: {
    width: '100%',
  },
  barContainer: {
    display: 'flex',
    gap: '1rem',
    flexDirection: 'column',
  },
  barScrapContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    rowGap: '0.5rem',
  },
  barSegmentContainer: {
    display: 'flex',
    borderRadius: '4px',
    overflow: 'hidden',
  },
}));

export const StatisticsBar = ({
  statistics,
  type,
}: StatisticsBarProps): ReactElement => {
  const classes = useStyles({});

  const getStatistics = {
    default: getTotalFindings,
    engine: getTotalFindingsByEngine,
  };

  const data = getStatistics[type](statistics);

  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const total = data.reduce((acc, current) => acc + current.value, 0);

  const extendedData = data.map(item => ({
    ...item,
    percentage: (100 * item.value) / total,
  }));

  return (
    <div className={classes.content}>
      <div className={classes.barContainer}>
        <div className={classes.barSegmentContainer}>
          {!!total ? (
            extendedData.map(item => (
              <StatisticsBarSegment
                key={item.key}
                color={item.color}
                percentage={item.percentage}
                onHover={() => setHoveredElementId(item.key)}
                isHovered={item.key === hoveredElementId}
                onLeave={() => setHoveredElementId(null)}
              />
            ))
          ) : (
            <StatisticsBarSegment percentage={100} isHovered={false} />
          )}
        </div>
        <div className={classes.barScrapContainer}>
          {extendedData.map(item => (
            <StatisticsBarScrap
              key={item.key}
              color={item.color}
              value={total ? item.value : 0}
              name={item.key}
              onHover={() =>
                total ? setHoveredElementId(item.key) : undefined
              }
              onLeave={() => (total ? setHoveredElementId(null) : undefined)}
              isHovered={total ? item.key === hoveredElementId : false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

import { useRef, useState, useCallback } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { Tag, Tooltip } from '../../../components';
import { useResize } from '../../../hooks';

const useStyles = makeStyles(() => ({
  cellContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  hiddenCellContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflow: 'hidden',
    cursor: 'pointer',
    height: '0',
    opacity: '0',
  },
  tooltipContainer: {
    display: 'flex',
    flexDirection: 'column',
    margin: '6px',
    gap: '4px',
  },
  listHeader: {
    fontWeight: 700,
    fontSize: '12px',
  },
  listContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    width: '100%',
    paddingLeft: '12px',
    gap: '2px',
    margin: 0,
  },
  listItem: {
    fontSize: '12px',
    fontWeight: 400,
  },
}));

export const ProjectTableLanguages = ({
  items = [],
}: {
  items: [string, number][];
}) => {
  const languagesNode = useRef<HTMLDivElement | null>(null);
  const indicatorNode = useRef<HTMLDivElement | null>(null);
  const [displayingLength, setDisplayingLength] = useState(0);

  const classes = useStyles();

  const compare = useCallback(() => {
    const allChildren: HTMLElement[] | null = languagesNode?.current?.children
      ?.length
      ? Array.from(languagesNode?.current?.children).map(
          item => item?.children?.[0] as HTMLElement,
        )
      : null;

    if (allChildren) {
      let currentWidth = 0;
      const visibleItems = [];

      allChildren.forEach(child => {
        const spanWidth = child?.offsetWidth;

        const indicatorWidth = indicatorNode?.current?.offsetWidth || 0;

        if (currentWidth + spanWidth + indicatorWidth + 25 < 270) {
          visibleItems.push(child);
          currentWidth += spanWidth;
        }
      });
      setDisplayingLength(visibleItems?.length);
    }
  }, []);

  useResize(compare);

  return (
    <Tooltip
      extendedClasses={{ tooltip: { borderRadius: '8px' } }}
      isAlwaysVisible
      tooltipContent={
        <div className={classes.tooltipContainer}>
          <Typography
            className={classes.listHeader}
            variant="caption"
            component="span"
          >
            Languages{' '}
            <Typography
              variant="caption"
              component="span"
              style={{ fontWeight: 400 }}
            >{`(${items?.length})`}</Typography>
          </Typography>

          <ul className={classes.listContent}>
            {items.map((language: [string, number]) => {
              const lg = language[0];
              return (
                lg?.length && (
                  <li key={`tooltip_${lg}`}>
                    <Typography className={classes.listItem}>{lg}</Typography>
                  </li>
                )
              );
            })}
          </ul>
        </div>
      }
    >
      <div style={{ width: '310px' }}>
        <div ref={languagesNode} className={classes.hiddenCellContainer}>
          {items?.map((language: [string, number]) => {
            const lg = language[0];
            return lg?.length && <Tag key={lg} label={lg} width="auto" />;
          })}
          <Tag
            label={`+${items.length - displayingLength}`}
            width="auto"
            ref={indicatorNode}
          />
        </div>
        <div className={classes.cellContainer}>
          {items
            ?.slice(0, displayingLength)
            .map((language: [string, number]) => {
              const lg = language[0];
              return lg?.length && <Tag key={lg} label={lg} width="auto" />;
            })}
          {items?.length > displayingLength && (
            <Tag label={`+${items.length - displayingLength}`} width="auto" />
          )}
        </div>
      </div>
    </Tooltip>
  );
};

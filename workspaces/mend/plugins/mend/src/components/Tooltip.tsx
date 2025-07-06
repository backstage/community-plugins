import type { ReactElement } from 'react';
import { useRef, useState, useCallback } from 'react';
import {
  makeStyles,
  Theme,
  Tooltip as MaterialTooltip,
} from '@material-ui/core';
import { useResize } from '../hooks';

type ExtendedClassesProps = {
  tooltip?: {
    [key: string]: string | number;
  };
  arrow?: {
    [key: string]: string | number;
  };
};

type TooltipProps = {
  children: string | ReactElement;
  tooltipContent: string | ReactElement;
  isAlwaysVisible?: boolean;
  extendedClasses?: ExtendedClassesProps;
};

const useStyles = makeStyles<
  Theme,
  {
    extendedClasses?: ExtendedClassesProps;
  }
>(theme => ({
  tooltip: ({ extendedClasses }) => ({
    backgroundColor:
      theme.palette.type === 'light'
        ? '#232F3E'
        : theme.palette.background.default,
    ...extendedClasses?.tooltip,
  }),
  arrow: {
    color:
      theme.palette.type === 'light'
        ? '#232F3E'
        : theme.palette.background.default,
  },
}));

const useAdditionalStyles = makeStyles(() => ({
  contentWrapper: {
    cursor: 'auto',
    display: 'block',
    width: 'max-content',
  },
}));

export const Tooltip = ({
  children,
  tooltipContent,
  isAlwaysVisible = true,
  extendedClasses = {},
}: TooltipProps) => {
  const node = useRef<HTMLDivElement | null>(null);

  const [isEllipsis, setIsEllipsis] = useState(false);

  const compare = useCallback(() => {
    const firstChild = node?.current?.children?.length
      ? Array.from(node?.current?.children)?.[0]
      : null;
    let refChild = null;

    if (firstChild) {
      refChild = firstChild?.children?.length
        ? firstChild?.children?.[0]
        : firstChild;
    }

    if (refChild) setIsEllipsis(refChild?.scrollWidth > refChild?.clientWidth);
  }, []);

  useResize(compare);

  const isDisabled = isAlwaysVisible ? false : !isEllipsis;
  const classes = useStyles({ extendedClasses });
  const additionalClasses = useAdditionalStyles();

  return (
    <MaterialTooltip
      classes={classes}
      title={tooltipContent}
      disableHoverListener={isDisabled}
      placement="top"
      arrow
      interactive
    >
      <span className={additionalClasses.contentWrapper} ref={node}>
        {children}
      </span>
    </MaterialTooltip>
  );
};

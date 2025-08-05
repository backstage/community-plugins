import { forwardRef } from 'react';
import { Chip, makeStyles, Theme } from '@material-ui/core';

export enum TagColor {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  DEPENDENCIES = 'dependencies',
  CODE = 'code',
  CONTAINERS = 'containers',
  ACTIVE = 'active',
  DISABLED = 'disabled',
  SUCCESS = 'success',
  NEUTRAL = 'neutral',
}

export const colorVariants: {
  [key: string]: {
    backgroundColor: string;
    color: string;
  };
} = {
  critical: {
    backgroundColor: '#a72461',
    color: 'white',
  },
  high: {
    backgroundColor: '#f73c57',
    color: 'white',
  },
  medium: {
    backgroundColor: '#f09c4f',
    color: '#232f3e',
  },
  low: {
    backgroundColor: '#f6bc35',
    color: '#232f3e',
  },
  dependencies: {
    backgroundColor: '#3453c1',
    color: 'white',
  },
  code: {
    backgroundColor: '#3e8bff',
    color: 'white',
  },
  containers: {
    backgroundColor: '#4bc4d4',
    color: 'white',
  },
  active: {
    backgroundColor: '#E7F5FC',
    color: '#0073B9',
  },
  disabled: {
    backgroundColor: '#EDEEEF',
    color: '#232F3E',
  },
  success: {
    backgroundColor: '#E9F7F4',
    color: '#007C5D',
  },
  neutral: {
    backgroundColor: '#E7E8EB',
    color: '#232F3E',
  },
};

type TagProps = {
  color?: TagColor;
  label: string | number;
  shapeVariant?: 'rounded' | 'square';
  width?: string;
  height?: string;
  fontWeight?: number;
};

const useStyles = makeStyles<
  Theme,
  {
    color: string;
    shapeVariant: string;
    width: string;
    height: string;
    fontWeight: number;
  }
>(() => ({
  root: ({ color, shapeVariant, width, height }) => ({
    ...colorVariants[color],
    borderRadius: shapeVariant === 'square' ? '4px' : '',
    width,
    margin: 0,
    textTransform: 'none',
    height,
  }),
  label: ({ fontWeight }) => ({
    fontSize: '12px',
    fontWeight,
  }),
}));

export const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    {
      label = '',
      color = TagColor.NEUTRAL,
      shapeVariant = 'rounded',
      width = 'auto',
      height = '',
      fontWeight = 400,
    },
    ref,
  ) => {
    const classes = useStyles({
      color,
      shapeVariant,
      width,
      height,
      fontWeight,
    });
    return <Chip classes={classes} label={label} ref={ref} />;
  },
);

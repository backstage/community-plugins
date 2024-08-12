import { ReactElement } from 'react';
import { Statistics } from './../../models';

export type BarChartData = {
  key: string;
  value: number;
  color: string;
  diff: number;
  isIncrease: boolean;
};

export type StatisticsBarProps = {
  statistics: Statistics;
  type: 'default' | 'engine';
  tooltipContent?: ReactElement | null;
};

export type StatisticsBarSegmentProps = {
  percentage: number;
  color?: string;
  tooltipContent?: ReactElement | null;
  onHover?: () => void;
  onLeave?: () => void;
  isHovered: boolean;
};

export type StatisticsBarScrapProps = {
  color: string;
  value: number;
  name: string;
  onHover?: () => void;
  onLeave?: () => void;
  isHovered: boolean;
};

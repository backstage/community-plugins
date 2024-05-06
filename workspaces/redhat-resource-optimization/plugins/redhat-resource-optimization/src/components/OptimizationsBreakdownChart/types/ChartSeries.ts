import type { VictoryStyleInterface } from 'victory-core';
import type { ChartData } from './ChartData';
import type { ChartLegendItem } from './ChartLegendItem';

export interface ChartSeries {
  childName?: string;
  data?: [ChartData];
  legendItem?: ChartLegendItem;
  style?: VictoryStyleInterface;
}

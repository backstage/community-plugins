import { Statistics, StatisticsName, StatisticsEngine } from '../../models';
import { BarChartData } from './statisticsBar.types';

export const getTotalFindings = (data: Statistics): BarChartData[] => {
  return [
    {
      value: data?.[StatisticsName.CRITICAL],
      key: StatisticsName.CRITICAL,
      color: '#a72461',
      diff: 0,
      isIncrease: true,
    },
    {
      value: data?.[StatisticsName.HIGH],
      key: StatisticsName.HIGH,
      color: '#f73c57',
      diff: 0,
      isIncrease: true,
    },
    {
      value: data?.[StatisticsName.MEDIUM],
      key: StatisticsName.MEDIUM,
      color: '#f09c4f',
      diff: 0,
      isIncrease: true,
    },
    {
      value: data?.[StatisticsName.LOW],
      key: StatisticsName.LOW,
      color: '#f6bc35',
      diff: 0,
      isIncrease: true,
    },
  ];
};

export const getTotalFindingsByEngine = (
  data: Statistics,
): BarChartData[] => {
  return [
    {
      value: data?.[StatisticsEngine.DEPENDENCIES]?.total,
      key: StatisticsEngine.DEPENDENCIES,
      color: '#3453c1',
      diff: 0,
      isIncrease: true,
    },
    {
      value: data?.[StatisticsEngine.CODE]?.total,
      key: StatisticsEngine.CODE,
      color: '#3e8bff',
      diff: 0,
      isIncrease: true,
    },
    {
      value: data?.[StatisticsEngine.CONTAINERS]?.total,
      key: StatisticsEngine.CONTAINERS,
      color: '#4bc4d4',
      diff: 0,
      isIncrease: true,
    },
  ];
};

export const linearGradient =
  'linear-gradient(135deg, transparent 25%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.2) 50%, transparent 50%, transparent 75%, rgba(255, 255, 255, 02) 75%, rgba(255, 255, 255, 0.2) 75%, rgba(255, 255, 255, 0.2) 100%)';

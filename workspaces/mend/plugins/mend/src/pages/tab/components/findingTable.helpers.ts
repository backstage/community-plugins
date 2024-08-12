import { Finding, Statistics } from '../../../models';

export const getFindingStatistics = (data: Finding[] = []) => {
  return data.reduce<Statistics>(
    (prev, next) => {
      prev[next.kind][next.level] = prev[next.kind][next.level]! + 1;
      prev[next.kind].total = prev[next.kind].total + 1;

      prev[next.level] = prev[next.level] + 1;
      prev.total = prev.total + 1;

      return prev;
    },
    {
      dependencies: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      code: { critical: null, high: 0, medium: 0, low: 0, total: 0 },
      containers: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    },
  );
};

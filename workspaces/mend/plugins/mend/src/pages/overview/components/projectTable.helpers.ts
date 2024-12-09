import { Project, Statistics } from '../../../models';

export const getProjetStatistics = (data: Project[] = []) => {
  return data.reduce<Statistics>(
    (prev, next) => {
      prev.dependencies.critical =
        prev.dependencies.critical + next.statistics.dependencies.critical;
      prev.dependencies.high =
        prev.dependencies.high + next.statistics.dependencies.high;
      prev.dependencies.medium =
        prev.dependencies.medium + next.statistics.dependencies.medium;
      prev.dependencies.low =
        prev.dependencies.low + next.statistics.dependencies.low;
      prev.dependencies.total =
        prev.dependencies.total + next.statistics.dependencies.total;

      prev.code.high = prev.code.high + next.statistics.code.high;
      prev.code.medium = prev.code.medium + next.statistics.code.medium;
      prev.code.low = prev.code.low + next.statistics.code.low;
      prev.code.total = prev.code.total + next.statistics.code.total;

      prev.containers.critical =
        prev.containers.critical + next.statistics.containers.critical;
      prev.containers.high =
        prev.containers.high + next.statistics.containers.high;
      prev.containers.medium =
        prev.containers.medium + next.statistics.containers.medium;
      prev.containers.low =
        prev.containers.low + next.statistics.containers.low;
      prev.containers.total =
        prev.containers.total + next.statistics.containers.total;

      prev.critical = prev.critical + next.statistics.critical;
      prev.high = prev.high + next.statistics.high;
      prev.medium = prev.medium + next.statistics.medium;
      prev.low = prev.low + next.statistics.low;
      prev.total = prev.total + next.statistics.total;

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

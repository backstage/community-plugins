export const enum UsageType {
  cpuUsage = 'cpuUsage',
  memoryUsage = 'memoryUsage',
}

// eslint-disable-next-line no-shadow
export type Interval = 'shortTerm' | 'mediumTerm' | 'longTerm';

// eslint-disable-next-line no-shadow
export const enum OptimizationType {
  cost = 'cost',
  performance = 'performance',
}

// eslint-disable-next-line no-shadow
export const enum RecommendationType {
  cpu = 'cpu',
  memory = 'memory',
}

// eslint-disable-next-line no-shadow
export const enum ResourceType {
  limits = 'limits',
  requests = 'requests',
}

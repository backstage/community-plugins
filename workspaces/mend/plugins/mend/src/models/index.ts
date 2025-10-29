export enum StatisticsName {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  TOTAL = 'total',
}

export enum StatisticsEngine {
  DEPENDENCIES = 'dependencies',
  CODE = 'code',
  CONTAINERS = 'containers',
}

type StatisticsBase = {
  [StatisticsName.CRITICAL]: number;
  [StatisticsName.HIGH]: number;
  [StatisticsName.MEDIUM]: number;
  [StatisticsName.LOW]: number;
  [StatisticsName.TOTAL]: number;
};

export type Statistics = {
  [StatisticsEngine.DEPENDENCIES]: StatisticsBase;
  [StatisticsEngine.CODE]: Omit<StatisticsBase, StatisticsName.CRITICAL> & {
    [StatisticsName.CRITICAL]: null;
  };
  [StatisticsEngine.CONTAINERS]: StatisticsBase;
} & StatisticsBase;

export type EntityURL = {
  path: string;
  params: {
    org?: string;
    repo?: string;
  };
  namespace?: string;
  kind: string;
  source: string;
};

export type Project = {
  statistics: Statistics;
  uuid: string;
  name: string;
  path: string;
  applicationName: string;
  applicationUuid: string;
  lastScan: number;
  languages: Array<[string, number]>;
  entity: EntityURL;
};

export enum FindingIssueStatus {
  CREATED = 'created',
  REVIEWED = 'reviewed',
  UNREVIEWED = 'unreviewed',
  SUPPRESSED = 'suppressed',
}

export type Finding = {
  kind: StatisticsEngine;
  level: StatisticsName;
  name: string;
  origin: string;
  time: string;
  projectId: string;
  projectName: string;
  issue: {
    issueStatus: string;
    ticketName: string;
    tracking: string;
    reporter: string;
    creationDate: string;
    link: string;
    status: FindingIssueStatus;
  };
};

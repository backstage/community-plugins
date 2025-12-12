/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

/*
 * Copyright 2024 The Backstage Authors
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
export type ProjectDetails = {
  projectId: number;
  projectName: string;
  usersQuantity: number;
  id: number;
  launchesQuantity: number;
  launchesPerUser: number;
  uniqueTickets: number;
  launchesPerWeek: number;
  lastRun: number;
  entryType: string;
  configuration: {
    subTypes: {
      [key: string]: [
        {
          id: number;
          locator: string;
          typeRef: string;
          longName: string;
          shortName: string;
          color: string;
        },
      ];
    };
  };
  users: [
    {
      login: string;
      projectRole: string;
    },
  ];
  creationDate: number;
};

export type LaunchDetails = {
  owner: string;
  share: boolean;
  description: string;
  id: number;
  uuid: string;
  name: string;
  number: number;
  startTime: number;
  endTime: number;
  lastModified: number;
  status: string;
  statistics: {
    executions: {
      passed: number;
      failed: number;
      skipped: number;
      total: number;
    };
    defects: {
      [key: string]: {
        total: number;
        [key: string]: number;
      };
    };
    mode: string;
    approximateDuration: number;
    hasRetries: boolean;
    rerun: boolean;
  };
};

export type PageType = {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type LaunchDetailsResponse = {
  content: LaunchDetails[];
  page: PageType;
};

export type ProjectListResponse = {
  content: ProjectDetails[];
  page: PageType;
};

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

import { IndexableDocument } from '@backstage/plugin-search-common';

/**
 * The document type for search module
 * @public
 */
export interface ReportPortalDocument extends IndexableDocument {
  /**
   * Type of resource being indexed
   */
  resourceType: 'Project' | 'Launch';
  /**
   * hostname of resource being indexed
   */
  host?: string;
  /**
   * Unique id for every resource
   */
  resourceId?: string | number;
  /**
   * Project name for launches that are indexed
   */
  projectName?: string;
  /**
   * Entity Ref of the entity that is linked with report portal
   */
  entityRef?: string;
}

/**
 * Type for project api response
 * @public
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

/**
 * Type for launches api response
 * @public
 */

export type LaunchDetails = {
  owner: string;
  share: boolean;
  description: string;
  id: number;
  uuid: string;
  name: string;
  number: number;
  startTime: number | string;
  endTime: number | string;
  lastModified: number | string;
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

/**
 * Common page type response
 * @public
 */
export type PageType = {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/**
 * Launch details response type
 * @public
 */
export type LaunchDetailsResponse = {
  content: LaunchDetails[];
  page: PageType;
};

/**
 * Project details response type
 * @public
 */
export type ProjectListResponse = {
  content: ProjectDetails[];
  page: PageType;
};

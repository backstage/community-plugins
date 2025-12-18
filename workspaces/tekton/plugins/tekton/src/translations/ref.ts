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

import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * Tekton translation reference.
 * @public
 */
export const tektonTranslationRef = createTranslationRef({
  id: 'tekton',
  messages: {
    errorPanel: {
      title: 'There was a problem retrieving Kubernetes objects',
      description:
        'There was a problem retrieving some Kubernetes resources for the entity: {{entityName}}. This could mean that the Error Reporting card is not completely accurate.',
    },
    permissionAlert: {
      title: 'Permission required',
      description:
        'To view Tekton Pipeline Runs, contact your administrator to give you the following permission(s): {{permissions}}.',
    },
    statusSelector: {
      label: 'Status',
    },
    clusterSelector: {
      label: 'Cluster',
    },
    tableExpandCollapse: {
      collapseAll: 'Collapse all',
      expandAll: 'Expand all',
    },
    pipelineVisualization: {
      emptyState: {
        description: 'No Pipeline Run to visualize',
      },
      noTasksDescription: 'This Pipeline Run has no tasks to visualize',
      stepList: {
        finallyTaskTitle: 'Finally Task',
      },
    },
    pipelineRunList: {
      title: 'Pipeline Runs',
      noPipelineRuns: 'No Pipeline Runs found',
      searchBarPlaceholder: 'Search',
      rowActions: {
        viewParamsAndResults: 'View Parameters and Results',
        viewLogs: 'View logs',
        unauthorizedViewLogs: 'Unauthorized to view logs',
        viewSBOM: 'View SBOM',
        SBOMNotApplicable: 'View SBOM is not applicable for this PipelineRun',
        viewOutput: 'View output',
        outputNotApplicable:
          'View Output is not applicable for this PipelineRun',
      },
      vulnerabilitySeverityTitle: {
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      tableHeaderTitle: {
        name: 'NAME',
        vulnerabilities: 'VULNERABILITIES',
        status: 'STATUS',
        taskStatus: 'TASK STATUS',
        startTime: 'STARTED',
        duration: 'DURATION',
        actions: 'ACTIONS',
      },
      tablePagination: {
        rowsPerPageOptionLabel: '{{num}} rows',
      },
    },
    pipelineRunLogs: {
      title: 'PipelineRun Logs',
      noLogs: 'No logs found',
      downloader: {
        downloadTaskLogs: 'Download',
        downloadPipelineRunLogs: 'Download all tasks logs',
      },
      podLogsDownloadLink: {
        title: 'Download',
        downloading: 'downloading logs',
      },
      taskStatusStepper: {
        skipped: 'Skipped',
      },
    },
    pipelineRunOutput: {
      title: 'PipelineRun Output',
      noOutput: 'No output',
    },
    pipelineRunStatus: {
      All: 'All',
      Cancelling: 'Cancelling',
      Succeeded: 'Succeeded',
      Failed: 'Failed',
      Running: 'Running',
      'In Progress': 'In Progress',
      FailedToStart: 'FailedToStart',
      PipelineNotStarted: 'PipelineNotStarted',
      Skipped: 'Skipped',
      Cancelled: 'Cancelled',
      Pending: 'Pending',
      Idle: 'Idle',
      Other: 'Other',
    },
    pipelineRunDuration: {
      lessThanSec: 'less than a sec',
      hour_one: '{{count}} hour',
      hour_other: '{{count}} hours',
      minute_one: '{{count}} minute',
      minute_other: '{{count}} minutes',
      second_one: '{{count}} second',
      second_other: '{{count}} seconds',
    },
    pipelineRunParamsAndResults: {
      title: 'PipelineRun Parameters and Results',
      noParams: 'No parameters found',
      noResults: 'No results found',
      params: 'Parameters',
      results: 'Results',
      outputTableColumn: {
        name: 'Name',
        value: 'Value',
      },
    },
  },
});

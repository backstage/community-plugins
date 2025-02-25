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
import { Entity } from '@backstage/catalog-model';

export const JIRA_EPIC_KEY_ANNOTATION = 'jira/epic-key';
export const JIRA_PROJECT_KEY_ANNOTATION = 'jira/project-key';
const JIRA_COMPONENT_ANNOTATION = 'jira/component';
const JIRA_LABEL_ANNOTATION = 'jira/label';
const JIRA_INCOMING_ISSUES_STATUS = 'jira/incoming-issues-status';
const JIRA_INPROGRESS_ISSUES_STATUS = 'jira/inprogress-issues-status';
const JIRA_BLOCKED_ISSUES_STATUS = 'jira/blocked-issues-status';
const JIRA_DONE_ISSUES_STATUS = 'jira/done-issues-status';

/**
 * @public
 *
 * Custom hook to extract JIRA-related annotations from an entity's metadata.
 *
 * @param {Entity} entity - The entity object containing metadata with JIRA annotations.
 * @returns {Object} An object containing the following JIRA-related properties:
 * - `projectKey`: The JIRA project key.
 * - `component`: The JIRA component.
 * - `label`: The JIRA label.
 * - `epicKey`: The JIRA epic key.
 * - `jiraBreakdownTodoStatus`: The status for incoming JIRA issues.
 * - `jiraBreakdownInProgressStatus`: The status for in-progress JIRA issues.
 * - `jiraBreakdownBlockStatus`: The status for blocked JIRA issues.
 * - `jiraBreakdownDoneStatus`: The status for done JIRA issues.
 */
export const useAPIEntity = (entity: Entity) => {
  return {
    projectKey: entity.metadata?.annotations?.[
      JIRA_PROJECT_KEY_ANNOTATION
    ] as string,
    component: entity.metadata?.annotations?.[
      JIRA_COMPONENT_ANNOTATION
    ] as string,
    label: entity.metadata?.annotations?.[JIRA_LABEL_ANNOTATION] as string,
    epicKey: entity.metadata?.annotations?.[JIRA_EPIC_KEY_ANNOTATION] as string,
    jiraBreakdownTodoStatus: entity.metadata?.annotations?.[
      JIRA_INCOMING_ISSUES_STATUS
    ] as string,
    jiraBreakdownInProgressStatus: entity.metadata?.annotations?.[
      JIRA_INPROGRESS_ISSUES_STATUS
    ] as string,
    jiraBreakdownBlockStatus: entity.metadata?.annotations?.[
      JIRA_BLOCKED_ISSUES_STATUS
    ] as string,
    jiraBreakdownDoneStatus: entity.metadata?.annotations?.[
      JIRA_DONE_ISSUES_STATUS
    ] as string,
  };
};

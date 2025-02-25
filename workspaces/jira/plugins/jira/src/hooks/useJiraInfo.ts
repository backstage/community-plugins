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
import { useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import { jiraApiRef } from '../api';

/**
 * @public
 *
 * Custom hook to fetch Jira information based on provided parameters.
 *
 * @param {string} projectKey - The key of the Jira project.
 * @param {string} component - The component within the Jira project.
 * @param {string} label - The label associated with the Jira issues.
 * @param {string} epicKey - The key of the epic in Jira.
 *
 * @returns {object} An object containing the following properties:
 * - `loading` (boolean): Indicates if the data is currently being loaded.
 * - `issues` (any[] | undefined): The list of issues fetched from Jira, or undefined if not yet fetched.
 * - `error` (string | undefined): The error message if an error occurred, or undefined if no error.
 * - `fetchJiraInfo` (function): A function to manually trigger fetching the Jira information.
 */
export const useJiraInfo = (
  projectKey: string,
  component: string,
  label: string,
  epicKey: string,
) => {
  const api = useApi(jiraApiRef);

  const getJiraDetails = useCallback(async () => {
    try {
      const result = await api.getIssueDetails(
        projectKey,
        component,
        label,
        epicKey,
      );
      return { issues: result };
    } catch (err: any) {
      return { error: err.message };
    }
  }, [api, projectKey, component, label, epicKey]);

  const [state, fetchJiraInfo] = useAsyncFn(
    () => getJiraDetails(),
    [projectKey, component, label, epicKey],
  );

  useEffect(() => {
    fetchJiraInfo();
  }, [projectKey, component, label, epicKey, fetchJiraInfo]);

  return {
    loading: state.loading,
    issues: state.value?.issues,
    error: state.value?.error,
    fetchJiraInfo,
  };
};

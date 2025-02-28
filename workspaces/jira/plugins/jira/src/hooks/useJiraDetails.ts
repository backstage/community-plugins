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
import { useState, useEffect } from 'react';
import { useJiraInfo } from './useJiraInfo';

/**
 * @public
 *
 * Custom hook to fetch and manage Jira details including issues and their subtasks.
 *
 * @param projectKey - The key of the Jira project.
 * @param component - The component within the Jira project.
 * @param label - The label associated with the Jira issues.
 * @param jiraEpic - The key of the Jira epic.
 * @returns An object containing the list of issues, project key, loading state, and any error message.
 */
export const useJiraDetails = (
  projectKey: string,
  component: string,
  label: string,
  jiraEpic: string,
) => {
  const jiraDetails = useJiraInfo(projectKey, component, label, jiraEpic);
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!jiraEpic || jiraEpic === 'N/A') {
      setError('Epic Key is empty. Please check and try again.');
      setLoading(false);
      return;
    }

    if (!jiraDetails.loading && jiraDetails?.error) {
      setError(jiraDetails?.error);
      setLoading(false);
      return;
    }

    if (jiraDetails?.issues) {
      const updatedIssues = [
        jiraEpic,
        ...jiraDetails.issues.flatMap(
          (story: { key: string; subtasks?: { key: string }[] }) => {
            const storyKeys = [story.key];
            const subtaskKeys = story.subtasks
              ? story.subtasks.map(subtask => subtask.key)
              : [];
            return [...storyKeys, ...subtaskKeys];
          },
        ),
      ];

      setIssues(updatedIssues);
      setLoading(false);
    }
  }, [jiraEpic, jiraDetails?.issues, jiraDetails?.error, jiraDetails.loading]);

  return { issues: issues, projectKey, loading, error };
};

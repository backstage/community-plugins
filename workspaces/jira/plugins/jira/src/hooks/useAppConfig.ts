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
import { configApiRef, useApi } from '@backstage/core-plugin-api';

/**
 * @public
 *
 * Custom hook to retrieve and parse the Jira filtered views configuration.
 *
 * This hook uses the `configApi` to fetch an optional configuration array
 * named 'jira.filteredViews'. It then processes each configuration item,
 * extracting the 'title' and 'issueLabels' properties, and constructs a
 * map where the key is the title and the value is an array of issue labels.
 *
 * @returns {Map<string, string[]>} A map where each key is a title and the value is an array of issue labels.
 */
export const useAppConfig = () => {
  const configApi = useApi(configApiRef);
  const jiraFilteredViews =
    configApi.getOptionalConfigArray('jira.filteredViews');
  const filteredViews: Map<string, string[]> = new Map();

  jiraFilteredViews?.forEach(filterConfig => {
    const title = filterConfig.getString('title');
    const issueLabels = filterConfig.getString('issueLabels');

    if (title && issueLabels) {
      const issueLabelsArray = issueLabels
        .split(',')
        .map(label => label.trim());
      filteredViews.set(title, issueLabelsArray);
    }
  });

  return filteredViews;
};

/**
 * @public
 *
 * Hook to build a Jira URL for a given Jira issue.
 *
 * @param {string} jiraIssue - The Jira issue key or ID.
 * @returns {string} The full URL to the Jira issue in the Jira portal.
 */
export const useBuildJiraUrl = (jiraIssue: string) => {
  const configApi = useApi(configApiRef);
  const portalUrl = configApi.getString('jira.portalUrl');
  return `${portalUrl}${jiraIssue}`;
};

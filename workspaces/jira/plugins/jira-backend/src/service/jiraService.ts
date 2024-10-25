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

import { Config } from '@backstage/config';
import { Knex } from 'knex';
import { JiraApiClient } from './jiraApiClient';

export class JiraService {
  private readonly jiraApi: JiraApiClient;
  private readonly jiraDomain: string | undefined;

  constructor(private readonly db: Knex, config: Config) {
    this.jiraDomain = config.getOptionalString('backend.jira.target');
    this.jiraApi = new JiraApiClient({
      discoveryApi: {
        getBaseUrl: () => Promise.resolve(this.jiraDomain),
      },
      config,
    });
  }

  // Fetching Jira issues and storing them in the database
  async fetchAndStoreIssues(
    jql: string,
    maxResults: number,
    startAt: number,
    username: string,
  ) {
    console.log('Fetching issues from Jira...');

    try {
      await this.db('current_user')
        .insert({
          id: 'single_user',
          username: username,
          email: username,
        })
        .onConflict('id')
        .merge();

      // Call Jira API to get the list of issues
      const issues = await this.jiraApi.listIssues(
        jql,
        maxResults,
        startAt,
        username,
      );
      console.log('🚀 ~ JiraService ~ issues:', issues);
      const issuesArray = issues?.issues;
      // console.log('🚀 ~ JiraService ~ issuesArray:', issuesArray);

      for (const issue of issuesArray) {
        await this.db('jira_issues')
          .insert({
            issue_id: issue.id,
            title: issue.fields.summary,
            status: issue.fields.status.name,
            priority: issue.fields.priority.name,
            description: issue.fields.issuetype.description,
            assignee: issue.fields.assignee?.displayName || 'Unassigned',
            reporter: issue.fields.reporter?.displayName || 'Unknown',
            url: `${this.jiraDomain}/jira/software/projects/${
              issue.key.split('-')[0]
            }/issues/${issue.key}`,
            created_at: issue.fields.created,
            updated_at: issue.fields.updated,
          })
          .onConflict('issue_id')
          .merge();
      }
      return issues?.total;
    } catch (error) {
      console.error('Error in fetchAndStoreIssues:', error);
      throw new Error('Failed to fetch and store Jira issues');
    }
  }

  // Retrieve stored Jira issues from the database
  async getStoredIssues() {
    try {
      return await this.db('jira_issues').select('*');
    } catch (error) {
      console.error('Error in getStoredIssues:', error);
      throw new Error('Failed to retrieve stored Jira issues');
    }
  }

  // Retrieving the user email for cron
  async getCurrentUserEmail(): Promise<string | null> {
    try {
      const result = await this.db('current_user').select('email').first();
      return result ? result.email : null;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return null;
    }
  }
}

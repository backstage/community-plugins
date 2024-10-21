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

import cron from 'node-cron';
import { JiraService } from '../service/jiraService';

// Function to schedule Jira fetching task
export function scheduleJiraTask(jiraService: JiraService) {
  cron.schedule('*/60 * * * *', async () => {
    console.log('Running scheduled Jira task...');

    // Fetch the current user's email from the database
    const userEmail = await jiraService.getCurrentUserEmail();

    if (!userEmail) {
      console.error('No user email found in the database. Skipping task.');
      return;
    }

    console.log(`Fetched user email: ${userEmail}`);

    const jql = 'ORDER BY Created';
    const maxResults = 100;
    const startAt = 0;

    try {
      const dataCount = await jiraService.fetchAndStoreIssues(
        jql,
        maxResults,
        startAt,
        userEmail,
      );
      console.log(
        `Fetched and stored ${dataCount} Jira issues for ${userEmail}`,
      );
    } catch (error) {
      console.error('Error during Jira API call:', error);
    }
  });

  console.log('Jira cron job has been scheduled.');
}

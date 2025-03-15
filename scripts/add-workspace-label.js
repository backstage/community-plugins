#!/usr/bin/env node
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

import { listWorkspaces } from './list-workspaces.js';
import { Octokit } from '@octokit/rest';

async function main() {
  const issueBody = process.env.ISSUE_BODY;
  const issueNumber = process.env.ISSUE_NUMBER;
  const token = process.env.GITHUB_TOKEN;

  if (!issueBody || !issueNumber || !token) {
    console.error('Missing required environment variables.');
    process.exit(1);
  }

  const regex = /Workspace\s*[\r\n]+([^\r\n]+)/;
  const match = issueBody.match(regex);

  let workspace = '';
  if (match) {
    workspace = match[1].trim();
  }
  const workspaces = await listWorkspaces();
  let label = 'needs-triaging';
  if (workspaces.includes(workspace)) {
    label = `workspace/${workspace}`;
  }

  const octokit = new Octokit({ auth: token });

  try {
    await octokit.issues.addLabels({
      owner: 'backstage',
      repo: 'community-plugins',
      issue_number: Number(issueNumber),
      labels: [label],
    });

    console.log(`Label "${label}" added successfully!`);
  } catch (error) {
    console.error(`Failed to add label: ${error.message}`);
    process.exit(1);
  }
}
main().catch(console.error);

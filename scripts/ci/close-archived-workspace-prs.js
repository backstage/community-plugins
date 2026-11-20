/*
 * Copyright 2026 The Backstage Authors
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

import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Octokit } from '@octokit/rest';

export function archivedWorkspacesForPr(files, archived, workspaceExists) {
  // GitHub limits the list-files endpoint to 3,000 files. Never decide from
  // an incomplete list (or a PR with no changed files).
  if (files.length === 0 || files.length >= 3000) {
    return [];
  }

  const workspaces = new Set();
  for (const file of files) {
    const match = /^workspaces\/([^/]+)\//.exec(file.filename);
    if (
      !match ||
      file.status === 'added' ||
      !archived.has(match[1]) ||
      workspaceExists(match[1])
    ) {
      return [];
    }
    workspaces.add(match[1]);
  }
  return [...workspaces];
}

export async function closeArchivedWorkspacePrs({
  octokit,
  owner,
  repo,
  archived,
  workspaceExists,
}) {
  const prs = await octokit.paginate(octokit.pulls.list, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  for (const pr of prs) {
    const files = await octokit.paginate(octokit.pulls.listFiles, {
      owner,
      repo,
      pull_number: pr.number,
      per_page: 100,
    });
    const workspaces = archivedWorkspacesForPr(
      files,
      archived,
      workspaceExists,
    );
    if (workspaces.length === 0) {
      continue;
    }

    console.log(
      `Closing PR #${pr.number}: archived workspace(s) ${workspaces.join(', ')}`,
    );
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pr.number,
      body: `Closing this PR because the workspace(s) it changes (${workspaces.map(w => `\`workspaces/${w}\``).join(', ')}) have been archived and are no longer present on the default branch. Thank you for the contribution.`,
    });
    await octokit.pulls.update({
      owner,
      repo,
      pull_number: pr.number,
      state: 'closed',
    });
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  if (!owner || !repo || !process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
  }
  const archived = new Set(
    JSON.parse(
      readFileSync('.github/archived-plugins.json', 'utf8'),
    ).archived.map(entry => entry.workspace),
  );
  await closeArchivedWorkspacePrs({
    octokit: new Octokit({ auth: process.env.GITHUB_TOKEN }),
    owner,
    repo,
    archived,
    workspaceExists: workspace => existsSync(`workspaces/${workspace}`),
  });
}

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

// Approves and enables auto-merge on Renovate and Dependabot PRs that only
// change yarn.lock files in workspaces that opted in with
// `"autoMergeDependencies": true` in their bcp.json. GitHub merges the PR once
// the required checks pass.
//
// Run from actions/github-script, see automate_dependency_automerge.yml.

import fs from 'node:fs/promises';
import path from 'node:path';

const LOCKFILE = /^workspaces\/([^/]+)\/yarn\.lock$/;

/**
 * Decides whether a PR is eligible for automerge from its changed files.
 * `isOptedIn` is called with each workspace name.
 */
export async function evaluate(files, isOptedIn) {
  if (!files.length) {
    return { eligible: false, reason: 'No changed files' };
  }

  const workspaces = new Set();
  for (const file of files) {
    const match = file.match(LOCKFILE);
    if (!match) {
      return {
        eligible: false,
        reason: `${file} is not a workspace yarn.lock`,
      };
    }
    workspaces.add(match[1]);
  }

  for (const workspace of workspaces) {
    if (!(await isOptedIn(workspace))) {
      return {
        eligible: false,
        reason: `Workspace ${workspace} has not opted in to autoMergeDependencies`,
      };
    }
  }

  return { eligible: true, workspaces: [...workspaces] };
}

/**
 * Reads the opt-in flag from the base branch checkout, so a PR can't opt
 * itself in by editing bcp.json.
 */
export function bcpOptIn(rootDir) {
  return async workspace => {
    try {
      const bcp = JSON.parse(
        await fs.readFile(
          path.join(rootDir, 'workspaces', workspace, 'bcp.json'),
          'utf8',
        ),
      );
      return bcp.autoMergeDependencies === true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  };
}

export async function run({ github, context, core, serviceAccount }) {
  const { owner, repo } = context.repo;
  const pr = context.payload.pull_request;
  const pull_number = pr.number;

  const files = (
    await github.paginate(github.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number,
      per_page: 100,
    })
  ).map(f => f.filename);

  const result = await evaluate(
    files,
    bcpOptIn(process.env.GITHUB_WORKSPACE ?? process.cwd()),
  );

  const reviews = await github.paginate(github.rest.pulls.listReviews, {
    owner,
    repo,
    pull_number,
    per_page: 100,
  });
  const ourApproval = reviews
    .filter(r => r.user?.login === serviceAccount)
    .pop();
  const approved = ourApproval?.state === 'APPROVED';

  if (!result.eligible) {
    core.info(`Not eligible for automerge: ${result.reason}`);
    // If the PR was eligible before and changed since, back out
    if (approved) {
      core.info('Removing our earlier approval and disabling auto-merge');
      await github.rest.pulls.dismissReview({
        owner,
        repo,
        pull_number,
        review_id: ourApproval.id,
        message: `No longer eligible for dependency automerge: ${result.reason}`,
      });
      await github.graphql(
        `mutation ($id: ID!) { disablePullRequestAutoMerge(input: { pullRequestId: $id }) { clientMutationId } }`,
        { id: pr.node_id },
      );
    }
    return;
  }

  core.info(
    `Eligible for automerge, lockfile changes in: ${result.workspaces.join(', ')}`,
  );

  if (approved) {
    core.info(`Already approved by ${serviceAccount}`);
  } else {
    await github.rest.pulls.createReview({
      owner,
      repo,
      pull_number,
      event: 'APPROVE',
      body: 'Approving lockfile-only dependency update for workspaces with `autoMergeDependencies` enabled.',
    });
  }

  await github.graphql(
    `mutation ($id: ID!) { enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) { clientMutationId } }`,
    { id: pr.node_id },
  );
  core.info('Auto-merge enabled, the PR merges once required checks pass');
}

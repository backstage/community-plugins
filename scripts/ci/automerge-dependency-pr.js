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
 * Accounts whose pushes are trusted: the dependency bots, and the service
 * account that adds changesets and lockfile dedupes. A push from anyone else
 * could have changed a lockfile by hand, so it always needs a human review.
 */
export const TRUSTED_ACTORS = new Set([
  'backstage-goalie[bot]',
  'dependabot[bot]',
  'backstage-service',
]);

/**
 * Checks who triggered this run before looking at the changed files.
 */
export async function evaluateEvent(actor, files, isOptedIn) {
  if (!TRUSTED_ACTORS.has(actor)) {
    return {
      eligible: false,
      reason: `Triggered by ${actor}, only pushes from the dependency bots are automerged`,
    };
  }
  return evaluate(files, isOptedIn);
}

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

const UNITS = {
  minute: 60e3,
  hour: 3600e3,
  day: 86400e3,
  week: 7 * 86400e3,
};

/**
 * Parses a Renovate duration such as "3 days" or "72 hours" into
 * milliseconds. Returns 0 when unset.
 */
export function parseDuration(value) {
  if (!value) {
    return 0;
  }
  const match = String(value)
    .trim()
    .match(/^(\d+)\s*(minute|hour|day|week)s?$/i);
  if (!match) {
    throw new Error(`Unsupported minimumReleaseAge ${JSON.stringify(value)}`);
  }
  return Number(match[1]) * UNITS[match[2].toLocaleLowerCase('en-US')];
}

/**
 * Reads minimumReleaseAge from the base branch Renovate config, so Renovate
 * and dependency automerge share one setting.
 */
export async function readMinimumReleaseAge(rootDir) {
  const config = JSON.parse(
    await fs.readFile(path.join(rootDir, '.github', 'renovate.json'), 'utf8'),
  );
  return parseDuration(
    config.npm?.minimumReleaseAge ?? config.minimumReleaseAge,
  );
}

/**
 * Returns the set of `resolution` values in a Yarn lockfile.
 */
export function lockfileResolutions(lockfile) {
  const resolutions = new Set();
  for (const match of lockfile.matchAll(/^\s+resolution: "(.+)"$/gm)) {
    resolutions.add(match[1]);
  }
  return resolutions;
}

/**
 * Returns the npm packages resolved in `head` but not in `base`. Workspace
 * and link packages are ignored. Anything that isn't an npm release, like a git or
 * tarball dependency, throws since its age can't be checked.
 */
export function newNpmPackages(base, head) {
  const before = lockfileResolutions(base);
  const packages = [];
  for (const resolution of lockfileResolutions(head)) {
    // workspace: and link: point at code in this repo, not the registry
    if (before.has(resolution) || /@(workspace|link):/.test(resolution)) {
      continue;
    }
    // patch: resolutions wrap an npm one, e.g. pkg@patch:pkg@npm%3A1.2.3#...
    const npm = decodeURIComponent(resolution).match(
      /^(?:.+@patch:)?((?:@[^/@]+\/)?[^/@]+)@npm:([^#]+)/,
    );
    if (!npm) {
      throw new Error(`Can't check the release age of ${resolution}`);
    }
    packages.push({ name: npm[1], version: npm[2] });
  }
  return packages;
}

/**
 * Returns the first package published less than `minimumAge` ago, or
 * undefined if all are old enough.
 */
export async function findTooNew(packages, minimumAge, now, getPublishTime) {
  if (!minimumAge) {
    return undefined;
  }
  for (const pkg of packages) {
    const published = await getPublishTime(pkg.name, pkg.version);
    if (!published) {
      throw new Error(`No publish time found for ${pkg.name}@${pkg.version}`);
    }
    if (now - published.getTime() < minimumAge) {
      return { ...pkg, published };
    }
  }
  return undefined;
}

async function npmPublishTime(name, version) {
  const res = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}`,
  );
  if (!res.ok) {
    throw new Error(`npm registry returned ${res.status} for ${name}`);
  }
  const time = (await res.json()).time?.[version];
  return time ? new Date(time) : undefined;
}

async function readLockfile(github, { owner, repo }, file, ref) {
  try {
    const { data } = await github.rest.repos.getContent({
      owner,
      repo,
      path: file,
      ref,
      mediaType: { format: 'raw' },
    });
    return String(data);
  } catch (error) {
    if (error.status === 404) {
      return '';
    }
    throw error;
  }
}

/**
 * Checks every package added to the PR's lockfiles was published at least
 * minimumReleaseAge ago. Returns a reason string if not.
 */
async function checkReleaseAge(github, context, pr, files, rootDir) {
  const minimumAge = await readMinimumReleaseAge(rootDir);
  if (!minimumAge) {
    return undefined;
  }
  try {
    for (const file of files) {
      const packages = newNpmPackages(
        await readLockfile(github, context.repo, file, pr.base.sha),
        await readLockfile(github, context.repo, file, pr.head.sha),
      );
      const tooNew = await findTooNew(
        packages,
        minimumAge,
        Date.now(),
        npmPublishTime,
      );
      if (tooNew) {
        return `${tooNew.name}@${
          tooNew.version
        } was published ${tooNew.published.toISOString()}, newer than the minimumReleaseAge in .github/renovate.json`;
      }
    }
  } catch (error) {
    return `Couldn't verify release ages: ${error.message}`;
  }
  return undefined;
}

export const BLOCKED_LABEL = 'automerge-blocked';

const BOT_BRANCHES = {
  'backstage-goalie[bot]': 'renovate/',
  'dependabot[bot]': 'dependabot/',
};

/**
 * Whether the scheduled sweep should look at a PR. PRs someone else pushed
 * to carry the blocked label and are left for a human.
 */
export function isScheduledCandidate(pr, repository) {
  const prefix = BOT_BRANCHES[pr.user?.login];
  return Boolean(
    prefix &&
    pr.head?.ref?.startsWith(prefix) &&
    pr.head?.repo?.full_name === repository &&
    pr.labels?.some(l => l.name === 'dependencies') &&
    !pr.labels?.some(l => l.name === BLOCKED_LABEL),
  );
}

/**
 * What to do with the blocked label for a PR event. A push from anyone else
 * blocks the PR. A push from a bot afterwards means it rewrote the branch
 * (Renovate and Dependabot don't push on top of other people's commits), so
 * the block is lifted.
 */
export function blockedLabelAction(actor, hasLabel) {
  if (!TRUSTED_ACTORS.has(actor)) {
    return hasLabel ? undefined : 'add';
  }
  return hasLabel ? 'remove' : undefined;
}

async function backOut({ github, core, owner, repo, pr, ourApproval, reason }) {
  // Auto-merge is turned off first so a failure later can't leave it
  // merging, and any error fails the job so it's visible.
  if (pr.auto_merge) {
    core.info('Disabling auto-merge');
    await github.graphql(
      `mutation ($id: ID!) { disablePullRequestAutoMerge(input: { pullRequestId: $id }) { clientMutationId } }`,
      { id: pr.node_id },
    );
  }
  if (ourApproval?.state === 'APPROVED') {
    core.info('Dismissing our earlier approval');
    await github.rest.pulls.dismissReview({
      owner,
      repo,
      pull_number: pr.number,
      review_id: ourApproval.id,
      message: `No longer eligible for dependency automerge: ${reason}`,
    });
  }
}

/**
 * Evaluates one PR and approves it, or backs out an earlier approval.
 * `actor` is who triggered the event, or undefined for the scheduled sweep,
 * which only ever approves.
 */
async function processPullRequest({
  github,
  context,
  core,
  serviceAccount,
  pr,
  actor,
}) {
  const { owner, repo } = context.repo;
  const pull_number = pr.number;
  const rootDir = process.env.GITHUB_WORKSPACE ?? process.cwd();

  if (actor) {
    const hasLabel = pr.labels?.some(l => l.name === BLOCKED_LABEL);
    const action = blockedLabelAction(actor, hasLabel);
    if (action === 'add') {
      core.info(`Pushed to by ${actor}, adding ${BLOCKED_LABEL}`);
      await github.rest.issues.addLabels({
        owner,
        repo,
        issue_number: pull_number,
        labels: [BLOCKED_LABEL],
      });
    } else if (action === 'remove') {
      core.info(`Branch rewritten by ${actor}, removing ${BLOCKED_LABEL}`);
      await github.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: pull_number,
        name: BLOCKED_LABEL,
      });
    }
  }

  const files = (
    await github.paginate(github.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number,
      per_page: 100,
    })
  ).map(f => f.filename);

  let result = actor
    ? await evaluateEvent(actor, files, bcpOptIn(rootDir))
    : await evaluate(files, bcpOptIn(rootDir));
  if (result.eligible) {
    const tooNew = await checkReleaseAge(github, context, pr, files, rootDir);
    if (tooNew) {
      result = { eligible: false, reason: tooNew };
    }
  }

  const reviews = await github.paginate(github.rest.pulls.listReviews, {
    owner,
    repo,
    pull_number,
    per_page: 100,
  });
  const ourApproval = reviews
    .filter(r => r.user?.login === serviceAccount)
    .pop();

  if (!result.eligible) {
    core.info(`#${pull_number} not eligible for automerge: ${result.reason}`);
    if (actor) {
      await backOut({
        github,
        core,
        owner,
        repo,
        pr,
        ourApproval,
        reason: result.reason,
      });
    }
    return;
  }

  core.info(
    `#${pull_number} eligible for automerge, lockfile changes in: ${result.workspaces.join(', ')}`,
  );

  if (ourApproval?.state === 'APPROVED') {
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

  if (!pr.auto_merge) {
    await github.graphql(
      `mutation ($id: ID!) { enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) { clientMutationId } }`,
      { id: pr.node_id },
    );
  }
  core.info('Auto-merge enabled, the PR merges once required checks pass');
}

/**
 * Entry point for pull_request_target events.
 */
export async function run({ github, context, core, serviceAccount }) {
  await processPullRequest({
    github,
    context,
    core,
    serviceAccount,
    pr: context.payload.pull_request,
    actor: context.actor,
  });
}

/**
 * Entry point for the scheduled sweep. Re-checks open dependency PRs, so ones
 * held back by minimumReleaseAge merge once they're old enough.
 */
export async function runScheduled({ github, context, core, serviceAccount }) {
  const { owner, repo } = context.repo;
  const repository = `${owner}/${repo}`;
  const pulls = await github.paginate(github.rest.pulls.list, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });
  const candidates = pulls.filter(pr => isScheduledCandidate(pr, repository));
  core.info(`Checking ${candidates.length} open dependency PR(s)`);

  let failures = 0;
  for (const pr of candidates) {
    try {
      await processPullRequest({ github, context, core, serviceAccount, pr });
    } catch (error) {
      failures++;
      core.error(`#${pr.number}: ${error.message}`);
    }
  }
  if (failures) {
    throw new Error(`${failures} PR(s) failed, see the log above`);
  }
}

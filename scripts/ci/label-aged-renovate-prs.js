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

import { Octokit } from '@octokit/rest';

const PATCH_MINOR_FORCE_MERGE_DAYS = 14; // 2 weeks
const MAJOR_FORCE_MERGE_DAYS = 42; // 6 weeks

const PATCH_MINOR_REMINDER_DAYS = 7; // 1 week
const MAJOR_REMINDER_DAYS = 21; // 3 weeks

// Marker to identify our reminder comments (to avoid duplicates)
const REMINDER_MARKER = '<!-- renovate-pr-reminder -->';

const RENOVATE_BOT = 'backstage-goalie[bot]';

/**
 * Determines if a PR is a major version bump based on title and branch name.
 *
 * Major bumps are identified by:
 * - Explicit "(major)" in title
 * - Branch name containing "major-" or "-major"
 * - Version pattern "to vX" (just major, no minor/patch) vs "to vX.Y.Z" (full semver)
 */
function isMajorBump(title, branch) {
  const titleLower = title.toLowerCase();
  const branchLower = branch.toLowerCase();

  const hasExplicitMajor =
    titleLower.includes('(major)') ||
    branchLower.includes('/major-') ||
    branchLower.includes('-major');

  // This regex matches "to v" followed by digits, then end of string or non-digit non-dot
  const majorOnlyPattern = /to v?(\d+)(?:\s|$|[^\d.])/i;
  const hasMajorOnlyVersion = majorOnlyPattern.test(title);

  return hasExplicitMajor || hasMajorOnlyVersion;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY environment variable is required');
  }

  const [owner, repo] = repository.split('/');

  const octokit = new Octokit({ auth: token });
  const now = new Date();

  const prs = await octokit.paginate(octokit.rest.pulls.list, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  const renovatePrs = prs.filter(pr => pr.user.login === RENOVATE_BOT);

  console.log(`Found ${renovatePrs.length} open Renovate PRs`);

  for (const pr of renovatePrs) {
    const createdAt = new Date(pr.created_at);
    const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    const hasForceLabel = pr.labels.some(label => label.name === 'force-merge');
    if (hasForceLabel) {
      console.log(`PR #${pr.number} already has force-merge label, skipping`);
      continue;
    }

    const isMajor = isMajorBump(pr.title, pr.head.ref);
    const reminderAge = isMajor
      ? MAJOR_REMINDER_DAYS
      : PATCH_MINOR_REMINDER_DAYS;
    const forceMergeAge = isMajor
      ? MAJOR_FORCE_MERGE_DAYS
      : PATCH_MINOR_FORCE_MERGE_DAYS;
    const bumpType = isMajor ? 'major' : 'patch/minor';

    console.log(
      `PR #${pr.number}: "${pr.title}" - ${bumpType} bump, ${ageInDays} days old (reminder: ${reminderAge}d, force-merge: ${forceMergeAge}d)`,
    );

    if (ageInDays >= forceMergeAge) {
      console.log(`Adding force-merge label to PR #${pr.number}`);
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: pr.number,
        labels: ['force-merge'],
      });
    } else if (ageInDays >= reminderAge) {
      // Check if we've already posted a reminder
      const comments = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pr.number,
      });

      const hasReminder = comments.data.some(c =>
        c.body.includes(REMINDER_MARKER),
      );

      if (!hasReminder) {
        const daysUntilForceMerge = forceMergeAge - ageInDays;
        const reminderMessage = [
          REMINDER_MARKER,
          `👋 **Reminder:** This Renovate ${bumpType} PR has been open for **${ageInDays} days**.`,
          '',
          `Please review and merge if the changes look good. If no action is taken, this PR will be labeled \`force-merge\` in **${daysUntilForceMerge} days**.`,
        ].join('\n');

        console.log(`Posting reminder comment to PR #${pr.number}`);
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pr.number,
          body: reminderMessage,
        });
      } else {
        console.log(`PR #${pr.number} already has reminder comment, skipping`);
      }
    }
  }

  console.log('Done processing Renovate PRs');
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});

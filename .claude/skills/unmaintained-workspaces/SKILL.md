---
name: unmaintained-workspaces
description: Create a GitHub issue for an unmaintained workspace in the community-plugins repo. Takes a single workspace name, gathers owner/PR/issue data, and creates an [Unmaintained] issue with a 30-day action deadline. Use when asked to file an unmaintained issue, flag a plugin for archival, or check a stale workspace.
---

# Unmaintained Workspace Issue

## Overview

This skill creates a GitHub issue to notify a workspace's owners that their plugin is unmaintained. A workspace is considered unmaintained when it is 3 or more Backstage minor versions behind the latest release. The 30-day archival clock starts when the issue is opened.

Run all commands from the root of the `community-plugins` repo. Scripts live at `.claude/skills/unmaintained-workspaces/scripts/`.

The user must provide a workspace name. If none was given, ask for one. To see which workspaces are candidates, the list script can be run without `--workspace`:

```bash
node .claude/skills/unmaintained-workspaces/scripts/list-unmaintained.cjs
```

## Step 1: Check Prerequisites

Verify the GitHub CLI is installed and authenticated:

```bash
gh auth status
```

If `gh` is not found, tell the user to install it from https://cli.github.com/ and stop. If it is not authenticated, tell the user to run `gh auth login` and stop.

Ensure the local repo is up to date with the upstream `main` branch. Check whether this is a fork or the upstream repo:

```bash
git remote -v
```

If the repo is a fork (origin points to a user's fork, not `backstage/community-plugins`):

- Check for an `upstream` remote. If missing, tell the user to add one: `git remote add upstream https://github.com/backstage/community-plugins.git`
- Fetch and check against upstream: `git fetch upstream main`
- Compare: `git rev-list HEAD..upstream/main --count`

If the repo is upstream (origin is `backstage/community-plugins`):

- Fetch and check against origin: `git fetch origin main`
- Compare: `git rev-list HEAD..origin/main --count`

If the local branch is behind, tell the user how many commits behind they are and suggest they pull or rebase before proceeding. Do not proceed with stale data.

## Step 2: Ensure Label Exists

```bash
gh label create unmaintained --description "Workspace has not been updated for 3+ Backstage versions" --color "D93F0B" --repo backstage/community-plugins 2>/dev/null || true
```

## Step 3: Validate and Gather Workspace Data

```bash
node .claude/skills/unmaintained-workspaces/scripts/list-unmaintained.cjs --workspace {workspace}
```

The script validates the workspace before returning data. If it exits with code 1, stderr contains a JSON object with `error` and `message`. Handle each error:

- **`workspace_not_found`**: Tell the user the workspace does not exist. Do not proceed.
- **`no_backstage_json`**: Tell the user the workspace has no `backstage.json`. Do not proceed.
- **`below_threshold`**: Tell the user the workspace does not meet the 3-version threshold, showing its current version and how far behind it is. Do not proceed.

On success, the script outputs JSON with `workspace`, `currentVersion`, `latestVersion`, `versionsBehind`, and `owners`.

After the script returns, check the `owners` array. If it is empty, the workspace has no dedicated owners and is only maintained by `@backstage/community-plugins-maintainers`. **Do not proceed** — tell the user this workspace has no dedicated owners and needs to be handled separately.

## Step 4: Check for Existing Issue

```bash
gh issue list --repo backstage/community-plugins --label unmaintained --search "[Unmaintained] {workspace}" --state open --json number,title
```

If an open `[Unmaintained]` issue already exists for this workspace, tell the user and stop.

## Step 5: Gather Open PRs

Each workspace has a label `workspace/{workspace}` (defined in `.github/labeler.yml`). Use it to find PRs:

```bash
gh pr list --repo backstage/community-plugins --label "workspace/{workspace}" --state open --json number,title,author,updatedAt,mergeable --limit 50
```

Separately identify version bump PRs (title matching `{workspace} - version:bump`).

## Step 6: Gather Open Issues

Use the same workspace label to find issues:

```bash
gh issue list --repo backstage/community-plugins --label "workspace/{workspace}" --state open --json number,title,author,updatedAt --limit 50
```

Exclude issue #4593 (upgrade dashboard) and #8982 (RFC) from the results.

## Step 7: Check Recent Activity and Auto Version Bump

Check for recent commits to the workspace directory:

```bash
git log --oneline --since="3 months ago" -- workspaces/{workspace}/
```

Check whether auto version bump is enabled for this workspace:

```bash
cat workspaces/{workspace}/bcp.json
```

Look at the `autoVersionBump` field. If the file doesn't exist or the field is missing, treat it as `false`.

This context is included in the issue body (see `{recent_activity_note}` in the template). If there are no recent commits and auto version bump is already enabled, omit the note entirely.

## Step 8: Compose the Issue

**Title:** `[Unmaintained] {workspace}`

**Labels:** `unmaintained`

**Body:** Use the template in the [Issue Template](#issue-template) section below. Replace all `{placeholders}` with actual data.

Field notes:

- **Owners**: Use `@username` mentions from the script output. If no dedicated owners (empty list), write: `@backstage/community-plugins-maintainers (no dedicated owners)`
- **Version bump section**: Include only if a version bump PR exists. Otherwise omit the section entirely.
- **PR/Issue tables**: Markdown table if any exist. "No open pull requests." or "No open issues." if none.
- **Dates in tables**: Format as `YYYY-MM-DD`.
- **Recent activity note**: Based on Step 7, pick the appropriate note for `{recent_activity_note}`:
  - **Recent activity + auto version bump on**: `We can see this workspace has had recent activity ({N} commits in the last 3 months, most recent on {date}). Version bumps are auto-generated and just need a review and merge, so catching up should be straightforward.`
  - **Recent activity + auto version bump off**: `We can see this workspace has had recent activity ({N} commits in the last 3 months, most recent on {date}). This workspace does not have [automatic version bump PRs](https://github.com/backstage/community-plugins/blob/main/docs/plugin-maintainers-guide.md#opt-in-to-automatic-version-bump-prs) enabled. Turning that on would make staying current much easier going forward.`
  - **No recent activity + auto version bump off**: `This workspace does not have [automatic version bump PRs](https://github.com/backstage/community-plugins/blob/main/docs/plugin-maintainers-guide.md#opt-in-to-automatic-version-bump-prs) enabled. Turning that on would make staying current much easier going forward.`
  - **No recent activity + auto version bump on**: Remove the `{recent_activity_note}` line entirely.

## Step 9: Display the Issue (Dry Run)

Display the full composed issue (title, labels, body) to the user. This is always a dry run — **do not create the issue**. End with:

```
This is a dry run. To create this issue, ask me to create it.
```

The user may request edits before creating. Only proceed to Step 10 if the user explicitly asks to create the issue.

## Step 10: Create the Issue (Only When Asked)

Only run this step if the user explicitly requests issue creation (e.g. "create it", "file the issue", "looks good, go ahead").

```bash
gh issue create \
  --repo backstage/community-plugins \
  --title "[Unmaintained] {workspace}" \
  --label "unmaintained" \
  --body "$(cat <<'ISSUE_EOF'
{composed_issue_body}
ISSUE_EOF
)"
```

Print the created issue URL.

---

## Issue Template

```markdown
## This workspace needs attention

The **{workspace}** workspace is **{versions_behind} Backstage versions behind** (currently on `{current_version}`, latest is `{latest_version}`).

|                               |                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| **Workspace**                 | [`{workspace}`](https://github.com/backstage/community-plugins/tree/main/workspaces/{workspace}) |
| **Owner(s)**                  | {owners}                                                                                         |
| **Current Backstage Version** | `{current_version}`                                                                              |
| **Latest Backstage Version**  | `{latest_version}`                                                                               |
| **Versions Behind**           | {versions_behind}                                                                                |
| **Open PRs**                  | {open_prs_count}                                                                                 |
| **Open Issues**               | {open_issues_count}                                                                              |

## Background

[Plugin owners are expected](https://github.com/backstage/community-plugins/blob/main/docs/plugin-maintainers-guide.md#plugin-owner-expectations) to keep their workspaces on a current Backstage release. This workspace is {versions_behind} versions behind and has {open_prs_count} open PRs piling up. The longer these sit, the more likely they'll conflict with each other and with upstream changes.

{recent_activity_note}

## Action required

**You have 30 days from this issue being opened to merge a version bump.** If no version bump is merged by then, this workspace will be [archived](https://github.com/backstage/community-plugins/blob/main/docs/plugin-maintainers-guide.md#archiving-a-plugin).

Only a merged version bump resets the clock. Commenting that you plan to get to it does not prevent archival.

If you can no longer maintain this workspace, let us know in the comments. We can look for a new owner, or proceed with archival.

{version_bump_section}

## Open pull requests ({open_prs_count})

{prs_table}

## Open issues ({open_issues_count})

{issues_table}

## Community

If you use this plugin and want it to stick around, comment here to volunteer as a new owner. If your organization owns this workspace, please push for the update internally. The [Plugin Maintainers Guide](https://github.com/backstage/community-plugins/blob/main/docs/plugin-maintainers-guide.md) covers what ownership involves.

---

_See the [Upgrade Dashboard](https://github.com/backstage/community-plugins/issues/4593) for current status of all workspaces._
```

### Version bump section

Include this section only when a version bump PR exists for the workspace. Otherwise omit it entirely.

```markdown
### Pending version bump

Version bump PRs already exist for this workspace:

| PR                 | Title   | Mergeable          |
| ------------------ | ------- | ------------------ |
| [#{number}]({url}) | {title} | {mergeable_status} |

Merging {latest_bump_pr_reference} would resolve this issue.
```

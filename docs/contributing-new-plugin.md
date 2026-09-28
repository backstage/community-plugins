# Contributing a New Plugin

This guide helps you decide whether `community-plugins` is the right home for your plugin and walks you through the proposal process. For the mechanical steps of creating workspaces, generating packages, and opening PRs, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Is community-plugins the right place for your plugin?

### When to contribute to backstage/backstage instead

Plugins that are core to Backstage's functionality live in [`backstage/backstage`](https://github.com/backstage/backstage). If your plugin isn't part of the core platform infrastructure, you're in the right place. See the [README](../README.md#what-is-the-community-plugins-repository) for more on this distinction.

### When to self-host your plugin

Most Backstage plugins are self-hosted. If you browse the [plugin directory](https://backstage.io/plugins), the majority live outside this repository. Self-hosting is a common, well-supported pattern that gives you full control over your release cadence, CI/CD, and versioning strategy with no dependency on reviewer availability. It's particularly well-suited if your plugin needs to iterate rapidly.

Contributing here means your plugin is published under the `@backstage-community` npm scope, gains discoverability through the community plugins directory, and benefits from shared CI, release tooling, and community review. In return, you adopt the repository's workflows and rely on volunteer reviewers for merges.

If release velocity is your priority, or if your plugin primarily serves your own organization's needs rather than the broader community, self-hosting might be a better suited option.

## Acceptance Criteria

To be accepted into `community-plugins`, a plugin must meet the following:

- **Apache 2.0 license.** All plugins in this repository are published under Apache 2.0. No other licenses are permitted.
- **Community relevance.** The plugin serves a broad enough audience to benefit the wider Backstage community, not just a single organization's internal needs.
- **Maintenance commitment.** You agree to the responsibilities of the [Plugin Maintainer role](https://github.com/backstage/community/blob/main/GOVERNANCE.md#plugin-maintainer), including monthly version bumps, PR reviews for your workspace, and issue triage.
- **Development velocity fit.** This is a volunteer-run repository. Reviewers contribute on their own time as capacity allows. If your plugin requires fast turnaround on reviews and releases, self-hosting is a better fit.

## Proposal Process

### Opening a proposal issue

Use the new plugin issue template to open your proposal. Describe what your plugin does and the problem it solves. If you're migrating an existing plugin, link to the current repository in your proposal since existing adoption strengthens your case.

### Feedback Window

Once your proposal issue is open, it enters a 14-day Feedback Window. During this period the community can signal demand, ask questions, and raise concerns.

For a proposal to move forward:

- The issue must remain open for at least 14 days. If there is clear community demand before the window closes, maintainers may choose to accept the proposal early.
- There must be evidence of community demand. This can come from community reactions or comments on the proposal issue, or the proposer can provide external evidence such as Discord threads, GitHub issues requesting the integration, or existing adoption metrics (npm downloads, GitHub stars) if migrating from another repository.
- The `@backstage/community-plugins-maintainers` team makes the final acceptance decision at the next Community Plugins SIG meeting after the window closes.

## Next Steps

Once your proposal is accepted, follow the [CONTRIBUTING.md](../CONTRIBUTING.md) guide for the mechanical steps: creating a workspace, generating packages, setting up local development, producing changesets and API reports, and opening your pull request.

Expect initial review feedback on your PR within 2-3 weeks. This is a typical timeframe, not a guarantee. Reviewers are volunteers contributing on their own time. If you haven't received a response after 3 weeks, leave a polite comment on the PR to bump visibility or raise it at the next Community Plugins SIG meeting.

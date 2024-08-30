# Contributing Guidelines

`backstage-plugin-announcements` is [MIT licensed](LICENSE.md) and accepts contributions via
GitHub pull requests. This document outlines some of the conventions on
the development workflow, commit message formatting, contact points, and other
resources to make it easier to get your contribution accepted.

Contributions are welcome, and they are greatly appreciated! Every little bit helps, and credit will always be given. ❤️

## Support Channels

The official support channels, for both users and contributors, are:

- GitHub [issues](https://github.com/backstage-community/backstage-plugin-announcements/issues)

## How to Contribute

Pull Requests (PRs) are the main and exclusive way to contribute to the project.

## Local setup

### Create a fork

[Fork][fork], then clone the repository:

```bash
git clone git@github.com:your_github_username/backstage-plugin-announcements.git
cd backstage-plugin-announcements
git remote add upstream https://github.com/backstage-community/backstage-plugin-announcements.git
git fetch upstream
```

### Install dependencies

```bash
cp env.sample .env

yarn install
```

### Run the plugins locally

A standalone development version of both the frontend and backend plugins are included in this repository.
They can be started as follows:

```bash
yarn dev # starts both the frontend and the backend in parallel
yarn start # starts the frontend only
yarn start-backend # starts the backend only
```

## Making Changes

Start by creating a new branch for your changes:

```bash
git checkout main
git fetch upstream
git rebase upstream/main
git checkout -b new-feature
```

Make your changes, then ensure that `yarn lint` and `yarn test` still pass. If you're satisfied with your changes, push them to your fork.

```bash
git push origin new-feature
```

Then use the GitHub UI to open a pull request.

Your changes are much more likely to be approved if you:

- add tests for new functionality
- write a [good commit message][commit-message]
- maintain backward compatibility

## Creating Changesets

We use [changesets](https://github.com/atlassian/changesets) in order to prepare releases. To make the process of generating releases easy, please include changesets with your pull request. This will result in a every package affected by a change getting a proper version number and an entry in its `CHANGELOG.md.

### When to use a changeset?

Any time a patch, minor, or major change aligning to [Semantic Versioning](https://semver.org) is made to any published package in `plugins/`, a changeset should be used.
In general, changesets are not needed for the documentation, build utilities or similar.

### How to create a changeset

1. Run `yarn changeset`
2. Select which packages you want to include a changeset for
3. Select impact of change that you're introducing, using `minor` for breaking changes and `patch` otherwise.
4. Explain your changes in the generated changeset. See [examples of well written changesets](https://backstage.io/docs/getting-started/contributors#writing-changesets).
5. Add generated changeset to git
6. Push the commit with your changeset to the branch associated with your PR

For more information, checkout [adding a changeset](https://github.com/atlassian/changesets/blob/master/docs/adding-a-changeset.md) documentation in the changesets repository.

[fork]: https://github.com/backstage-community/backstage-plugin-announcements/fork
[commit-message]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html

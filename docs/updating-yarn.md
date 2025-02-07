# Updating Yarn

## Overview

To keep workflows and tooling easy to maintain, we use a unique yarn version across all workspaces. This document outlines the process for updating the yarn version across all workspaces.

## Process

> [!NOTE] this is the process used from version 3.x to 4.x, future version could imply a different process.

### 1. Update Yarn Version

update the yarn version runing this command on the root of the repository:

```bash
yarn set version latest # or a specific version if is needed
```

### 2. Update Workspaces

Bumping from version 3 to 4 implies changes on all the workspaces `yarn.lock` files, to update all the following command can be used:

```bash
chmod +x ./scripts/yarn-install-all.sh
./scripts/yarn-install-all.sh
```

What this command does is to iterate over all the workspaces and run `yarn install --mode=update-lockfile` on each one. The `--mode=update-lockfile` flag is used to update the `yarn.lock` file only saving time form yarn link and other steps.

### 3. Create a PR

After running the previous command, a PR should be created with the changes on the `yarn.lock` files. This PR will affect all the workspaces but maintainer will only wait for a couple of approvals to merge it.

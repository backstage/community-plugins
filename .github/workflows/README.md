# Workflows

1. [ci.yml](./ci.yml)

This workflow runs on pull requests and it is supposed to run tests on the target branch. Since workspaces are isolated from each other, the workflow will perform a diff check to detect the workspaces with changes in order to speed up the checks.
Once all the checks succeed, the pull request can be merged.

2. [release_workspace.yml](./release_workspace.yml)

This workflow takes the name of a workspace as input and it is responsible for either creating a Version package PR in case there are changesets or performing a release of the packages in the specified workspace, in case some of them haven't been published.

Please refer to the [Changesets' documentation](https://github.com/changesets/changesets) to dig more into the details about how changesets work.

3. [release-all.yml](./release-all.yml)

This workflow is responsible for releasing all the workspaces by invoking [release_workspace.yml](./release_workspace.yml) in parallel on all workspaces. The workflow runs on the main branch, whenever something new is pushed into the branch. The workflow relies on [release_workspace.yml](./release_workspace.yml) to be smart enough to skip building the selected workspace, whenever no publishing is needed.

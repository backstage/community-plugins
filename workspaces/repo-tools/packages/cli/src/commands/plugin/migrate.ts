import chalk from 'chalk';
import fs from 'fs-extra';
import { OptionValues } from 'commander';
import findUp from 'find-up';
import path from 'path';
import { getPackages, Package } from '@manypkg/get-packages';
import { createWorkspace } from '../../lib/workspaces/createWorkspace';
import { ExitCodeError } from '../../lib/errors';

const getPaths = async (options: {
  monorepoPath: string;
  workspaceName: string;
}) => {
  const communityPluginsPackageJson = await findUp(
    async dir => {
      const packageJsonPath = path.join(dir, 'package.json');
      const hasPackageJson = await findUp.exists(packageJsonPath);
      if (hasPackageJson) {
        const packageJsonContents = require(packageJsonPath);
        if (packageJsonContents.name === '@backstage-community/plugins') {
          return packageJsonPath;
        }
      }

      return undefined;
    },
    { type: 'file' },
  );

  if (!communityPluginsPackageJson) {
    throw new Error('Could not find community plugins package.json');
  }

  const communityPluginsRoot = path.dirname(communityPluginsPackageJson);

  return {
    communityPluginsRoot,
    monorepoRoot: options.monorepoPath,
    workspacePath: path.join(
      communityPluginsRoot,
      'workspaces',
      options.workspaceName,
    ),
  };
};

const getMonorepoPackagesForWorkspace = async (options: {
  monorepoRoot: string;
  workspaceName: string;
}) => {
  const packages = await getPackages(options.monorepoRoot);

  const workspacePackages = packages.packages.filter(
    pkg =>
      pkg.packageJson.name.startsWith(
        `@backstage/plugin-${options.workspaceName}-`,
      ) ||
      pkg.packageJson.name === `@backstage/plugin-${options.workspaceName}`,
  );

  return workspacePackages;
};

const findNewFolderName = ({
  packageToBeMoved,
  workspaceName,
}: {
  packageToBeMoved: Package;
  workspaceName: string;
}) => {
  if (
    packageToBeMoved.packageJson.name === `@backstage/plugin-${workspaceName}`
  ) {
    return 'frontend';
  }

  return packageToBeMoved.packageJson.name.replace(
    `@backstage/plugin-${workspaceName}-`,
    '',
  );
};
const ensureWorkspaceExists = async (options: {
  workspacePath: string;
  workspaceName: string;
  communityPluginsRoot: string;
  force: boolean;
}) => {
  // check if the workspace exists, create it if not.
  const workspaceExists = await fs
    .access(options.workspacePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);

  if (workspaceExists) {
    if (options.force) {
      await fs.rmdir(options.workspacePath, { recursive: true });
    } else {
      console.error(
        chalk.red`Workspace already exists at ${options.workspacePath}, use --force to overwrite`,
      );
      throw new ExitCodeError(1);
    }
  }

  console.log(chalk.blue`Creating workspace at ${options.workspacePath}`);

  await createWorkspace({
    cwd: options.communityPluginsRoot,
    name: options.workspaceName,
  });
};

const fixWorkspaceDependencies = async (options: {
  dependencies: Record<string, string>;
  monorepoRoot: string;
}) => {
  const allBackstageMonorepoPackages = await getPackages(options.monorepoRoot);
  for (const [key, value] of Object.entries(options.dependencies)) {
    if (value.includes('workspace:')) {
      const currentVersion = allBackstageMonorepoPackages.packages.find(
        p => p.packageJson.name === key,
      );
      if (!currentVersion) {
        throw new Error(`Could not find package ${key} in the monorepo`);
      }
      options.dependencies[key] = `^${currentVersion.packageJson.version}`;
    }
  }
};
export default async (opts: OptionValues) => {
  const { monorepoPath, workspaceName, force } = opts as {
    monorepoPath: string;
    workspaceName: string;
    force: boolean;
  };

  const { communityPluginsRoot, monorepoRoot, workspacePath } = await getPaths({
    monorepoPath,
    workspaceName,
  });

  // find all the packages in the main monorepo that should be in the workspace
  const packagesToBeMoved = await getMonorepoPackagesForWorkspace({
    monorepoRoot,
    workspaceName,
  });
  if (packagesToBeMoved.length === 0) {
    console.error(chalk.red`No packages found for plugin ${workspaceName}`);
    process.exit(1);
  }

  console.log(
    chalk.green`Found ${packagesToBeMoved.length} packages to be moved`,
    chalk.blueBright`${packagesToBeMoved
      .map(p => p.packageJson.name)
      .join(', ')}`,
  );

  // Create new workspace in community plugins repository
  await ensureWorkspaceExists({
    workspacePath,
    workspaceName,
    communityPluginsRoot,
    force,
  });

  for (const packageToBeMoved of packagesToBeMoved) {
    // copy the contents to the new folders
    const newFolderName = findNewFolderName({
      packageToBeMoved,
      workspaceName,
    });

    const newPathForPackage = path.join(workspacePath, newFolderName);
    console.log(
      chalk.blue`Moving package ${packageToBeMoved.packageJson.name} to ${newPathForPackage}`,
    );

    // Move the code
    await fs.copy(packageToBeMoved.dir, newPathForPackage);

    // Update the package.jsons
    const packageJsonPath = path.join(newPathForPackage, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = packageJson.name.replace(
      `@backstage/plugin-${workspaceName}`,
      `@backstage-community/${workspaceName}`,
    );

    await fixWorkspaceDependencies({
      dependencies: packageJson.dependencies,
      monorepoRoot,
    });

    await fixWorkspaceDependencies({
      dependencies: packageJson.devDependencies,
      monorepoRoot,
    });

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // mark copied packages as deprecated and add changeset.

  console.log({ communityPluginsRoot });
};

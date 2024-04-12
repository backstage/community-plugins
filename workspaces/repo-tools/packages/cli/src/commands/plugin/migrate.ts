import chalk from 'chalk';
import fs from 'fs-extra';
import { OptionValues } from 'commander';
import findUp from 'find-up';
import path, { basename } from 'path';
import { getPackages, Package } from '@manypkg/get-packages';
import { createWorkspace } from '../../lib/workspaces/createWorkspace';
import { ExitCodeError } from '../../lib/errors';
import { promisify } from 'util';
import { execFile } from 'child_process';
import semver from 'semver';

const replace = require('replace-in-file');

const exec = promisify(execFile);

// Do some magic to get the right paths, that are idempotent regardless of where the command is run from
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

const generateNewPackageName = (name: string) =>
  name.replace(`@backstage/`, `@backstage-community/`);

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
  monorepoPackages: Package[];
  packagesToBeMoved: Package[];
}) => {
  for (const [key, value] of Object.entries(options.dependencies)) {
    // If the package is not being moved into the workspace, and it's a workspace dep then we need to change
    // the version to the one published at the time.
    if (
      value.includes('workspace:') &&
      !options.packagesToBeMoved.some(p => p.packageJson.name === key)
    ) {
      const currentVersion = options.monorepoPackages.find(
        p => p.packageJson.name === key,
      );
      if (!currentVersion) {
        throw new Error(`Could not find package ${key} in the monorepo`);
      }
      options.dependencies[key] = `^${currentVersion.packageJson.version}`;
    }
  }
};

const fixSourceCodeReferences = async (options: {
  packagesToBeMoved: Package[];
  workspacePath: string;
}) => {
  return await replace({
    files: path.join(options.workspacePath, '**', '*'),
    processor: (input: string) =>
      options.packagesToBeMoved.reduce((acc, { packageJson }) => {
        const newPackageName = generateNewPackageName(packageJson.name);
        return acc.replace(new RegExp(packageJson.name, 'g'), newPackageName);
      }, input),
  });
};

const findCurrentReleaseVersion = async (options: { monorepoRoot: string }) => {
  const rootPkgPath = path.resolve(options.monorepoRoot, 'package.json');
  const pkg = await fs.readJson(rootPkgPath);

  if (!semver.prerelease(pkg.version)) {
    return pkg.version;
  }

  const { stdout: revListStr } = await exec(
    'git',
    ['rev-list', 'HEAD', '--', 'package.json'],
    { cwd: options.monorepoRoot },
  );
  const revList = revListStr.trim().split(/\r?\n/);

  for (const rev of revList) {
    const { stdout: pkgJsonStr } = await exec(
      'git',
      ['show', `${rev}:package.json`],
      { cwd: options.monorepoRoot },
    );
    if (pkgJsonStr) {
      const pkgJson = JSON.parse(pkgJsonStr);
      if (!semver.prerelease(pkgJson.version)) {
        return pkgJson.version;
      }
    }
  }

  throw new Error('No stable release found');
};

const createChangeset = async (options: {
  packages: string[];
  workspacePath: string;
  message: string;
}) => {
  const changesetFile = path.join(
    options.workspacePath,
    '.changeset',
    `migrate-${new Date().getTime()}.md`,
  );

  const changesetContents = `
---
${options.packages.map(p => `'${p}': patch`).join('\n')}
---

${options.message}
`;

  await fs.writeFile(changesetFile, changesetContents.trim());
};

const deprecatePackage = async (options: { package: Package }) => {
  const newPackageName = generateNewPackageName(
    options.package.packageJson.name,
  );

  // first update the readme
  await fs.writeFile(
    path.join(options.package.dir, 'README.md'),
    `# Deprecated\n\nThis package has been moved to the [backstage-community/plugins](https://github.com/backstage/community-plugins) repository. Migrate to using \`${newPackageName}\` instead.\n`,
  );

  // then update package.json
  const packageJsonPath = path.join(options.package.dir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.deprecated = `This package has been moved to the backstage/community-plugins repository. You should migrate to using ${newPackageName} instead.`;
  packageJson.backstage ??= {};
  packageJson.backstage.moved = newPackageName;
  await fs.writeJson(packageJsonPath, packageJson);
};

export default async (opts: OptionValues) => {
  const { monorepoPath, workspaceName, force, branch } = opts as {
    monorepoPath: string;
    workspaceName: string;
    force: boolean;
    branch?: string;
  };

  try {
    await exec('git', ['status', '--porcelain'], { cwd: monorepoPath });
  } catch {
    console.error(
      chalk.red`The provided monorepo path is either not a git repository or not clean, please provide a valid monorepo path.`,
    );
    process.exit(1);
  }

  const latestBackstageRelease = await findCurrentReleaseVersion({
    monorepoRoot: monorepoPath,
  });

  console.log(
    chalk.blueBright`Found latest release version in monorepo: ${chalk.blue`${latestBackstageRelease}`}`,
  );

  // checkout that the latest release tag
  await exec('git', ['fetch', '--tags'], { cwd: monorepoPath });
  await exec('git', ['checkout', `v${latestBackstageRelease}`], {
    cwd: monorepoPath,
  });

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

  const monorepoPackages = await getPackages(monorepoRoot).then(
    ({ packages }) => packages,
  );

  // Create new workspace in community plugins repository
  await ensureWorkspaceExists({
    workspacePath,
    workspaceName,
    communityPluginsRoot,
    force,
  });

  for (const packageToBeMoved of packagesToBeMoved) {
    const newPathForPackage = path.join(
      workspacePath,
      packageToBeMoved.relativeDir,
    );
    console.log(
      chalk.blue`Moving package ${packageToBeMoved.packageJson.name} to ${newPathForPackage}`,
    );

    // Move the code, excluding the knip-report.md file
    await fs.copy(packageToBeMoved.dir, newPathForPackage, {
      filter: sourcePath => !['knip-report.md'].includes(basename(sourcePath)),
    });

    // Update the package.json versions to the latest published versions if not being moved across.
    const movedPackageJsonPath = path.join(newPathForPackage, 'package.json');
    const movedPackageJson = await fs.readJson(movedPackageJsonPath);

    await fixWorkspaceDependencies({
      dependencies: movedPackageJson.dependencies,
      monorepoPackages,
      packagesToBeMoved,
    });

    await fixWorkspaceDependencies({
      dependencies: movedPackageJson.devDependencies,
      monorepoPackages,
      packagesToBeMoved,
    });

    // Fix the repositories field in the new rrepo
    movedPackageJson.repository = {
      type: 'git',
      url: 'https://github.com/backstage/community-plugins',
      directory: `workspaces/${workspaceName}/${packageToBeMoved.relativeDir}`,
    };

    await fs.writeJson(movedPackageJsonPath, movedPackageJson, { spaces: 2 });
  }

  // Fix source code references for outdated package names
  await fixSourceCodeReferences({
    packagesToBeMoved,
    workspacePath,
  });

  // Create changeset for the new packages
  await createChangeset({
    packages: packagesToBeMoved.map(p =>
      generateNewPackageName(p.packageJson.name),
    ),
    workspacePath,
    message:
      'Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.',
  });
  // Create changeset for the old packages
  await createChangeset({
    packages: packagesToBeMoved.map(p => p.packageJson.name),
    workspacePath: monorepoRoot,
    message:
      'These packages have been migrated to the [backstage/community-plugins](https://github.com/backstage/community-plugins) repository.',
  });

  // run yarn install in the new workspace
  await exec('yarn', ['install'], { cwd: workspacePath });

  // reset monorepo
  await exec('git', ['checkout', 'master'], { cwd: monorepoPath });
  if (branch) {
    await exec('git', ['checkout', branch], { cwd: monorepoPath });
  } else {
    await exec('git', ['checkout', '-b', `migrate-${new Date().getTime()}`], {
      cwd: monorepoPath,
    });
  }

  // deprecate package in monorepo on new branch
  for (const packageToBeMoved of packagesToBeMoved) {
    await deprecatePackage({ package: packageToBeMoved });
  }

  // add files and commit
  await exec('git', ['add', '.'], { cwd: monorepoPath });
  await exec('git', ['commit', '-m', 'Deprecate packages', '-s'], {
    cwd: monorepoPath,
  });

  console.log(
    chalk.green`Changesets created, please commit and push both repositories.`,
  );
};

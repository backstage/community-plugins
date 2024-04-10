import { join } from 'path';
import { readJson, writeJson, copy, remove, rename } from 'fs-extra';
import { execSync } from 'child_process';

// TODO: think we should probably replace this with our own skeleton and not use create-app.
export const createWorkspace = async (opts: { name: string; cwd?: string }) => {
  const workspacePath = join(
    opts.cwd ?? process.cwd(),
    'workspaces',
    opts.name,
  );

  execSync(
    `npx --yes @backstage/create-app --path ${workspacePath} --skip-install`,
    { input: opts.name },
  );

  const workspacePackageJson = await readJson(
    join(workspacePath, 'package.json'),
  );
  const additionalDevDependencies = [
    '@changesets/cli',
    '@backstage/repo-tools',
  ];

  workspacePackageJson.devDependencies ??= {};
  workspacePackageJson.workspaces.packages = [
    'example-app/*',
    'node',
    'backend',
    'frontend',
    'react',
    'common',
  ];

  for (const additionalDependency of additionalDevDependencies) {
    const version = execSync(
      `npm show ${additionalDependency} version`,
    ).toString();
    workspacePackageJson.devDependencies[
      additionalDependency
    ] = `^${version.trim()}`;
  }

  workspacePackageJson.name = opts.name;

  await writeJson(join(workspacePath, 'package.json'), workspacePackageJson, {
    spaces: 2,
  });

  // Move the current packages directory to example app
  await rename(
    join(workspacePath, 'packages'),
    join(workspacePath, 'example-app'),
  );

  // Remove the plugins directory
  await remove(join(workspacePath, 'plugins'));
  await remove(join(workspacePath, 'lerna.json'));
  await remove(join(workspacePath, 'examples'));

  const tsConfigJson = await readJson(join(workspacePath, 'tsconfig.json'));

  tsConfigJson.include = ['*/src'];

  await writeJson(join(workspacePath, 'tsconfig.json'), tsConfigJson, {
    spaces: 2,
  });

  // experimental
  await copy(join(__dirname, '.changeset'), join(workspacePath, '.changeset'));
};

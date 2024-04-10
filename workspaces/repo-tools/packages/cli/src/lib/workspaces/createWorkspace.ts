import { join } from 'path';
import { readJson, writeJson, copy } from 'fs-extra';
import { execSync } from 'child_process';

// TODO: might be worth shipping our our template for create-app, especially if we decide
// to change the layout of the workspaces moving forward.
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

  // experimental
  // eslint-disable-next-line no-restricted-syntax
  await copy(join(__dirname, '.changeset'), join(workspacePath, '.changeset'));
};

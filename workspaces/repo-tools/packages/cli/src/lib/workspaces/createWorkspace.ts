import { join } from 'path';
import { readFile, writeFile, cp } from 'fs/promises';
import { execSync } from 'child_process';

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

  const workspaceRawJson = await readFile(join(workspacePath, 'package.json'), {
    encoding: 'utf8',
  });

  const workspacePackageJson = JSON.parse(workspaceRawJson);

  const additionalDevDependencies = [
    '@changesets/cli',
    '@backstage/repo-tools',
  ];

  workspacePackageJson.devDependencies ??= {};
  workspacePackageJson.workspaces.packages = [
    'example-backend',
    'example-frontend',
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

  await writeFile(
    join(workspacePath, 'package.json'),
    JSON.stringify(workspacePackageJson, null, 2),
  );

  // Experimental
  await cp(join(__dirname, '.changeset'), join(workspacePath, '.changeset'), {
    recursive: true,
  });
};

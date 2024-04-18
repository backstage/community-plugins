import { join } from 'path';
import { copy } from 'fs-extra';
import { execSync } from 'child_process';

// TODO: might be worth shipping our our template for create-app, especially if we decide
// to change the layout of the workspaces moving forward.
export const createWorkspace = async (opts: { name: string; cwd?: string }) => {
  const workspacePath = join(
    opts.cwd ?? process.cwd(),
    'workspaces',
    opts.name,
  );

  // eslint-disable-next-line no-restricted-syntax
  const templatePath = join(__dirname, 'templates', 'workspace');

  execSync(
    `npx --yes @backstage/create-app --path ${workspacePath} --skip-install --template-path=${templatePath}`,
    { input: opts.name },
  );

  // experimental test
  // eslint-disable-next-line no-restricted-syntax
  await copy(join(__dirname, '.changeset'), join(workspacePath, '.changeset'));
};

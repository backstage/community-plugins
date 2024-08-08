import { spawnSync } from 'node:child_process';

export function generateClientPackageSync(packageLocation, cwd) {
  spawnSync(
    'yarn',
    [
      'run',
      '-T',
      'backstage-repo-tools',
      'package',
      'schema',
      'openapi',
      'generate',
      '--client-package',
      packageLocation,
    ],
    {
      cwd,
      stdio: ['ignore', 'inherit', 'inherit'],
    },
  );
}

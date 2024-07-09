#!/usr/bin/env node
/* eslint-disable no-console */

const { dirname } = require('node:path');
const {
  cp,
  symlink,
  stat,
  lstat,
  rm,
  mkdir,
  constants,
} = require('node:fs/promises');

const errors = {
  ENOENT: 2, // No such file or directory
  EINVAL: 22, // Invalid argument
};

function locatePkg(pkgName) {
  return dirname(require.resolve(`${pkgName}/package.json`));
}

async function validateSourceAndDestination(source, destination) {
  try {
    await stat(source);
  } catch (e) {
    console.error(`${e.message}\nDid you forget to build the project?`);
    process.exit(errors[e.code]);
  }

  try {
    await stat(destination);
  } catch (e) {
    console.error(e.message);
    process.exit(errors[e.code]);
  }
}

async function main([op]) {
  const source = `${dirname(__dirname)}/dist`;
  const destination = `${locatePkg(
    '@janus-idp/backstage-plugin-orchestrator-backend',
  )}/static/generated`;
  await validateSourceAndDestination(source, destination);

  switch (op) {
    case 'debug': {
      const msg = [`source=${source}`, `destination=${destination}`]
        .join('\n')
        .trimEnd();
      console.log(msg);
      break;
    }
    case 'clean': {
      await rm(`${destination}/envelope`, { recursive: true, force: true });
      break;
    }
    case 'copy': {
      console.log(
        `Copying Editor Envelope files: ${source} -> ${destination}/envelope`,
      );

      let dirExists = false;
      try {
        const stats = await stat(`${destination}/envelope`, constants.S_IFDIR);
        dirExists = stats.isDirectory();
      } catch (error) {
        // skip...
      }

      if (!dirExists) {
        await mkdir(`${destination}/envelope`);
      }

      await cp(source, `${destination}/envelope`, {
        recursive: true,
        force: true,
      });
      break;
    }
    case 'link': {
      /**
       * This option exists for testing/dev purposes because it saves some space.
       * In the orchestrator-backend production artifact the files are copied into its static directory.
       */

      let existsAndIsSymLink = false;
      try {
        const stats = await lstat(`${destination}/envelope`);
        existsAndIsSymLink = stats.isSymbolicLink();
      } catch {
        // skip...
      }

      if (existsAndIsSymLink) {
        await rm(`${destination}/envelope`);
      }

      console.log(
        `Linking Editor Envelope files: ${destination}/envelope -> ${source}`,
      );
      await symlink(source, `${destination}/envelope`);
      break;
    }
    default:
      console.error(`Invalid argument: ${op}`);
      process.exit(errors.EINVAL);
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

'use strict';

// Inspired from https://github.com/ipfs/npm-kubo

const goenv = require('./go-platform');
const gunzip = require('gunzip-maybe');
const got = require('got').default;
const path = require('path');
const tarFS = require('tar-fs');
const unzip = require('unzip-stream');
const pkgConf = require('pkg-conf');
const cachedir = require('cachedir');
const fs = require('fs');
const hasha = require('hasha');

// Version of odo to install. This is known to be working with this plugin.
// Can be overridden by clients either via the BACKSTAGE_ODO_PLUGIN__ODO_VERSION environment variable
// or via the 'odo.version' field in their 'package.json' file.
const ODO_VERSION = '3.15.0';
const ODO_DIST_URL =
  'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo';
const ODO_DIST_URL_NIGHTLY =
  'https://s3.eu-de.cloud-object-storage.appdomain.cloud/odo-nightly-builds';

// Map of all architectures that can be donwloaded on the odo distribution URL.
const SUPPORTED_ARCHITECTURES_BY_PLATFORM = new Map(
  Object.entries({
    darwin: ['amd64', 'arm64'],
    linux: ['amd64', 'arm64', 'ppc64le', 's390x'],
    windows: ['amd64'],
  }),
);

/**
 * This avoids an expensive download if file is already in cache.
 *
 * @param {string} url
 * @param {string} platform
 * @param {string} arch
 * @param {string} version
 */
async function cachingFetchAndVerify(url, platform, arch, version) {
  const parentCacheDir = cachedir('odo');
  const cacheDir = path.join(parentCacheDir, version);
  const filename = url.split('/').pop();

  if (!filename) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const cachedFilePath = path.join(cacheDir, filename);
  const cachedHashPath = `${cachedFilePath}.sha256`;

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  if (
    version === 'latest' ||
    version === 'nightly' ||
    !fs.existsSync(cachedFilePath)
  ) {
    console.info(`Downloading ${url} to ${cacheDir}`);
    // download file
    fs.writeFileSync(cachedFilePath, await got(url).buffer(), {
      flag: fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_WRONLY,
    });
    console.info(`Downloaded ${url}`);

    // ..and checksum
    console.info(`Downloading ${filename}.sha256`);
    fs.writeFileSync(cachedHashPath, await got(`${url}.sha256`).buffer(), {
      flag: fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_WRONLY,
    });
    console.info(`Downloaded ${filename}.sha256`);
  } else {
    console.info(`Found ${cachedFilePath}`);
  }

  console.info(`Verifying ${filename}.sha256`);

  const digest = Buffer.alloc(64);
  const fd = fs.openSync(cachedHashPath, 'r');
  fs.readSync(fd, digest, 0, digest.length, 0);
  fs.closeSync(fd);
  const expectedSha = digest.toString('utf8');
  const calculatedSha = await hasha.fromFile(cachedFilePath, {
    encoding: 'hex',
    algorithm: 'sha256',
  });
  if (calculatedSha !== expectedSha) {
    console.log(`calculatedSha: ${calculatedSha.length}`);
    console.log(`expectedSha: ${expectedSha.length}`);
    throw new Error(
      `sha256 mismatch for file ${cachedFilePath}. Expected '${expectedSha}', but calculated '${calculatedSha}'.
  Maybe the file downloaded was incomplete? Try to delete the file to force a re-download: ${cachedFilePath}`,
    );
  }
  console.log(`OK (${expectedSha})`);

  const data = fs.createReadStream(cachedFilePath);

  await unpack(url, parentCacheDir, data);
  console.info(`Unpacked into ${parentCacheDir}`);

  // Rename file if needed
  let resultingFileName = 'odo';
  switch (platform) {
    case 'windows':
      resultingFileName = 'odo.exe';
      fs.renameSync(
        path.join(parentCacheDir, `odo-${platform}-${arch}.exe`),
        path.join(parentCacheDir, resultingFileName),
      );
      break;
    case 'darwin':
      fs.renameSync(
        path.join(parentCacheDir, `odo-${platform}-${arch}`),
        path.join(parentCacheDir, resultingFileName),
      );
      break;
    case 'linux':
      if (fs.existsSync(path.join(parentCacheDir, `odo-${platform}-${arch}`))) {
        fs.renameSync(
          path.join(parentCacheDir, `odo-${platform}-${arch}`),
          path.join(parentCacheDir, resultingFileName),
        );
      }
      break;
    default:
      break;
  }

  const p = path.join(parentCacheDir, resultingFileName);
  console.log(`odo binary (${version}) available at '${p}'`);
  return p;
}

/**
 * @param {string} url
 * @param {string} installPath
 * @param {import('stream').Readable} stream
 */
function unpack(url, installPath, stream) {
  return new Promise((resolve, reject) => {
    if (url.endsWith('.zip')) {
      return stream.pipe(
        unzip
          .Extract({ path: installPath })
          .on('close', resolve)
          .on('error', reject),
      );
    }

    return stream
      .pipe(gunzip())
      .pipe(
        tarFS.extract(installPath).on('finish', resolve).on('error', reject),
      );
  });
}

/**
 * @param {object} options
 * @param {string} options.version
 * @param {string} options.platform
 * @param {string} options.arch
 */
async function download({ version, platform, arch }) {
  let versionToDl = version;
  if (
    versionToDl !== 'latest' &&
    versionToDl !== 'nightly' &&
    !versionToDl.startsWith('v')
  ) {
    versionToDl = `v${version}`;
  }
  let url = `${ODO_DIST_URL}/${versionToDl}`;
  if (versionToDl === 'nightly') {
    url = ODO_DIST_URL_NIGHTLY;
  }
  url += `/odo-${platform}-${arch}.${
    platform === 'windows' ? 'exe.zip' : 'tar.gz'
  }`;
  return await cachingFetchAndVerify(url, platform, arch, version);
}

/**
 * @param {string} [platform]
 * @param {string} [arch]
 */
function enforcePlatformAndArch(platform, arch) {
  if (!SUPPORTED_ARCHITECTURES_BY_PLATFORM.has(platform)) {
    throw new Error(
      `No binary available for platform: ${platform}. Supported platforms: ${Array.from(
        SUPPORTED_ARCHITECTURES_BY_PLATFORM.keys(),
      ).join(', ')}`,
    );
  }

  const archs = SUPPORTED_ARCHITECTURES_BY_PLATFORM.get(platform);
  if (!archs?.includes(arch)) {
    throw new Error(
      `No binary available for platform/arch: ${platform}/${arch}. Supported architectures for ${platform}: ${archs.join(
        ', ',
      )}`,
    );
  }
}

/**
 * @param {string} [version]
 * @param {string} [platform]
 * @param {string} [arch]
 */
function buildArguments(version, platform, arch) {
  const conf = pkgConf.sync('odo', {
    cwd: process.cwd(),
    defaults: {
      version: ODO_VERSION,
      distUrl: ODO_DIST_URL,
    },
  });

  return {
    version:
      process.env.BACKSTAGE_ODO_PLUGIN__ODO_VERSION || version || conf.version,
    platform:
      process.env.BACKSTAGE_ODO_PLUGIN__TARGET_OS || platform || goenv.GOOS,
    arch: process.env.BACKSTAGE_ODO_PLUGIN__TARGET_ARCH || arch || goenv.GOARCH,
  };
}

/**
 * @param {string} [version]
 * @param {string} [platform]
 * @param {string} [arch]
 */
module.exports = async (version, platform, arch) => {
  const args = buildArguments(version, platform, arch);
  enforcePlatformAndArch(args.platform, args.arch);

  return await download(args);
};

#!/usr/bin/env node
/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import semver from 'semver';
import { promises as fs } from 'fs';
import { EOL } from 'os';

const BACKSTAGE_MANIFEST_URL =
  'https://versions.backstage.io/v1/tags/main/manifest.json';

async function fetchBackstageManifest() {
  const response = await fetch(BACKSTAGE_MANIFEST_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Backstage manifest: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

async function fetchSpecificRelease(tag) {
  const url = `https://api.github.com/repos/backstage/backstage/releases/tags/${tag}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Release not found
    }
    throw new Error(
      `Failed to fetch release ${tag}: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

async function setOutput(value) {
  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `should_trigger=${value}${EOL}`,
    );
  } else {
    console.log(`should_trigger=${value}`);
  }
}

async function main() {
  try {
    const manifest = await fetchBackstageManifest();
    console.log(`Current release version: ${manifest.releaseVersion}`);

    // find the .0 release (minor release) for the current major.minor
    const currentVersion = semver.clean(manifest.releaseVersion);
    const currentMajor = semver.major(currentVersion);
    const currentMinor = semver.minor(currentVersion);
    const minorReleaseTag = `v${currentMajor}.${currentMinor}.0`;

    console.log(`Looking for minor release: ${minorReleaseTag}`);

    // fetch the specific .0 release directly
    const minorRelease = await fetchSpecificRelease(minorReleaseTag);

    if (!minorRelease) {
      console.log(`Minor release ${minorReleaseTag} not found`);
      await setOutput('false');
      return;
    }

    const isRecent =
      (Date.now() - new Date(minorRelease.published_at)) /
        (1000 * 60 * 60 * 24) <=
      7;
    console.log(
      `Minor release ${minorReleaseTag} published: ${minorRelease.published_at}`,
    );
    console.log(`Within the past week: ${isRecent}`);

    if (!isRecent) {
      console.log('Minor release is older than 7 days');
      await setOutput('false');
      return;
    }

    await setOutput('true');
  } catch (error) {
    console.error('Error in Backstage release monitor:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});

#!/usr/bin/env node
/* eslint-disable @backstage/no-undeclared-imports */
/*
 * Copyright 2020 The Backstage Authors
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

import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { EOL } from 'os';

async function getBackstageVersion(workspace) {
  const rootPath = path.resolve(`workspaces/${workspace}/backstage.json`);
  if (!fs.exists(rootPath)) {
    return 'N/A';
  }
  return fs.readJson(rootPath).then(_ => _.version);
}

async function fetchWithRetry(url, retries = 1, delayMs = 60000) {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, { headers });
    const json = await response.json();

    if (response.ok) {
      return json;
    }

    // If it's a rate limit error, wait and retry
    if (
      (response.status === 403 || response.status === 429) &&
      attempt < retries
    ) {
      console.log(
        `Rate limit potentially hit (${response.status}). Waiting ${
          delayMs / 1000
        }s before retry...`,
      );
      await new Promise(resolve => setTimeout(resolve, delayMs));
      continue;
    }

    // Otherwise, throw an error
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}. ` +
        `Response: ${JSON.stringify(json, null, 2)}`,
    );
  }
  return null;
}

async function getLatestRelease() {
  return fetchWithRetry(
    'https://api.github.com/repos/backstage/backstage/releases/latest',
  );
}

async function getLatestPreRelease() {
  const json = await fetchWithRetry(
    'https://api.github.com/repos/backstage/backstage/releases',
  );

  const preReleasesOnly = json.filter(release => {
    return release.prerelease === true;
  });

  const latestPreRelease = preReleasesOnly.sort((a, b) => {
    return new Date(b.published_at) - new Date(a.published_at);
  })[0];

  return latestPreRelease;
}

async function main() {
  // Get the workspace and release line
  const [script, workspace, releaseLine] = process.argv.slice(1);
  if (!workspace || !releaseLine) {
    throw new Error(`Argument must be ${script} <workspace> <releaseLine>`);
  }

  // Get the current Backstage version from the backstage.json file
  const backstageVersion = await getBackstageVersion(workspace);
  // Get the latest Backstage Release from the GitHub API
  const latestRelease = await getLatestRelease();
  // Get the latest Backstage Pre-release from the GitHub API
  const latestPreRelease = await getLatestPreRelease();

  console.log(`Current Backstage version is: v${backstageVersion}`);
  console.log(
    `Latest Release version is: ${latestRelease.name}, published on: ${latestRelease.published_at}`,
  );
  console.log(
    `Latest Pre-release version is: ${latestPreRelease.name}, published on: ${latestPreRelease.published_at}`,
  );
  console.log();

  const latestReleaseDate = new Date(latestRelease.published_at).getTime();
  const latestPreReleaseDate = new Date(
    latestPreRelease.published_at,
  ).getTime();
  if (releaseLine === 'main' || latestReleaseDate > latestPreReleaseDate) {
    if (releaseLine === 'main') {
      console.log(
        `Selected release line is 'main', using Latest Release name ${latestRelease.name}`,
      );
    } else {
      console.log(
        `Latest Release is newer than latest Pre-release, using Latest Release name ${latestRelease.name}`,
      );
    }

    console.log();

    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `release_version=${latestRelease.name.substring(1)}${EOL}`,
    );
  } else {
    console.log(
      `Latest Release is older than latest Pre-release, using Latest Pre-release name ${latestPreRelease.name}`,
    );
    console.log();

    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `release_version=${latestPreRelease.name.substring(1)}${EOL}`,
    );
  }

  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `current_version=${backstageVersion}${EOL}`,
  );
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});

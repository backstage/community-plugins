#!/usr/bin/env node
/* eslint-disable @backstage/no-undeclared-imports */
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

// This script assumes that it is being ran from the plugins workspace,
// for example: `/workspaces/azure-devops` and would be called like this:
// `node ../../scripts/ci/generate-version-bump-changeset.js 1.29.1`

import fs from 'fs-extra';
import { getPackages } from '@manypkg/get-packages';
import { join } from 'path';

async function main() {
  // Get the releaseVersion
  const [script, releaseVersion] = process.argv.slice(1);
  if (!releaseVersion) {
    throw new Error(`Argument must be ${script} <release-version>`);
  }

  const workspacePlugins = join(process.cwd(), 'plugins');
  const workspaceChangesetFilename = `version-bump-${releaseVersion.replaceAll(
    '.',
    '-',
  )}.md`;
  const workspaceChangeset = join(
    process.cwd(),
    `.changeset/${workspaceChangesetFilename}`,
  );

  // Get the packages for this workspace filtering down to just those in the `@backstage-community` org
  // as this avoids including any sample `app` and/or sample `backend` in the changeset
  const { packages } = await getPackages(workspacePlugins);
  const packageEntries = packages
    .filter((p) => p.packageJson.name.includes('@backstage-community'))
    .map((p) => `'${p.packageJson.name}': patch`);

  // Populate the changeset contents
  const changeset = `---
${packageEntries.join('\n')}
---

Backstage version bump to v${releaseVersion}`;

  // Write the changeset file to the workspace's `.changeset` folder
  await fs.writeFile(workspaceChangeset, changeset);
}

main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});

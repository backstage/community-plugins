// #!/usr/bin/env node
/*
 * Copyright 2024 The Backstage Authors
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

/* eslint-disable no-console */

import { fileURLToPath } from 'node:url';
import { updateSchema } from './lib/openapi.mjs';
import { generateClientPackageSync } from './lib/yarn.mjs';
import { SourceFileMutator } from './lib/typescript.mjs';

const DEFAULT_PLUGIN_DIRECTORY = 'plugins/redhat-resource-optimization-common';
const DEFAULT_OPENAPI_SPEC_URL =
  'https://raw.githubusercontent.com/RedHatInsights/ros-ocp-backend/main/openapi.json';

function printUsage(scriptName) {
  const usage = `
Usage: ${scriptName} [OPTIONS] [DIRECTORY]

Options:
  -h | --help  Displays this help message.

Remarks:
 1. The default DIRECTORY is ${DEFAULT_PLUGIN_DIRECTORY}
`;
  return console.log(usage);
}

async function main(args) {
  if (/--help|-h/.test(args[1])) {
    printUsage(args[0]);
    process.exit();
  }

  const commonPackageDir = fileURLToPath(import.meta.resolve('../'));
  const saveLocation = `${commonPackageDir}/src/schema/openapi.yaml`;
  await updateSchema(DEFAULT_OPENAPI_SPEC_URL, saveLocation);

  const clientPackageLocation = args[1] ?? DEFAULT_PLUGIN_DIRECTORY;
  generateClientPackageSync(clientPackageLocation, commonPackageDir);

  const workspaceRootDir = fileURLToPath(import.meta.resolve('../../..'));
  const tsSourceFileMutator = new SourceFileMutator(
    `${workspaceRootDir}/tsconfig.json`,
  );
  console.log('Adding missing @public JSDoc tags for generated models');
  tsSourceFileMutator.addJsDocPublicTagsToGeneratedModels(
    `${commonPackageDir}/src/generated/models/*.model.ts`,
  );
  console.log('Adding missing @public JSDoc tags for pluginId.ts');
  tsSourceFileMutator.addJsDocPublicTagsToPluginId(
    `${commonPackageDir}/src/generated/pluginId.ts`,
  );
  console.log('Adding missing @public JSDoc tags for DefaultApi.client.ts');
  tsSourceFileMutator.addJsDocPublicTagToDefaultApiClient(
    `${commonPackageDir}/src/generated/apis/DefaultApi.client.ts`,
  );
  console.log(
    'Adding missing param hyphens to TSDoc methods for DefaultApi.client.ts',
  );
  tsSourceFileMutator.addMissingHyphenToTsDocParamTags(
    `${commonPackageDir}/src/generated/apis/DefaultApi.client.ts`,
  );
  console.log('Saving changes');
  tsSourceFileMutator.writeFilesSync();
  console.log('Done.');
}

main(process.argv.slice(1));

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

import yaml from 'js-yaml';
import fs from 'fs-extra';
import { resolve } from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const rootPath = resolve(__dirname, '..');
const githubIssueTemplatesPath = resolve(rootPath, '.github/ISSUE_TEMPLATE');

async function main(args) {
  console.log('Updating issue templates with workspace dropdown...');

  // Paths to the issue template files and dropdown snippet
  const bugTemplatePath = resolve(githubIssueTemplatesPath, '1-bug.yaml');
  const featureTemplatePath = resolve(
    githubIssueTemplatesPath,
    '2-feature.yaml',
  );
  const workspacesDropdownPath = resolve(
    githubIssueTemplatesPath,
    'snippets/workspaces-dropdown.yaml',
  );

  // Read the issue template files
  const bugTemplate = fs.readFileSync(bugTemplatePath, 'utf8');
  const featureTemplate = fs.readFileSync(featureTemplatePath, 'utf8');
  const workspacesDropdown = fs.readFileSync(workspacesDropdownPath, 'utf8');

  // Parse the YAML content
  const bugTemplateContent = yaml.load(bugTemplate);
  const featureTemplateContent = yaml.load(featureTemplate);
  const workspaceDropdownContent = yaml.load(workspacesDropdown);

  console.log({
    bugTemplateContent,
    featureTemplateContent,
    workspaceDropdownContent,
  });

  bugTemplateContent.body = bugTemplateContent.body.map(step => {
    if (step.id === 'workspace') {
      return workspaceDropdownContent;
    }
    return step;
  });

  featureTemplateContent.body = featureTemplateContent.body.map(step => {
    if (step.id === 'workspace') {
      return workspaceDropdownContent;
    }
    return step;
  });

  // Write the updated YAML back to the files
  fs.writeFileSync(bugTemplatePath, yaml.dump(bugTemplateContent));
  fs.writeFileSync(featureTemplatePath, yaml.dump(featureTemplateContent));

  console.log('Issue templates updated with workspace dropdown.');
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});

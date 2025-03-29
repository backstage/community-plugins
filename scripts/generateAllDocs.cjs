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
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const workspaceDir = path.join(root, 'workspace');
const outputDocsDir = path.join(root, 'docs-site', 'docs');
const homeDirName = 'home';

// Clean old docs-site/docs but keep 'home'
if (fs.existsSync(outputDocsDir)) {
  for (const entry of fs.readdirSync(outputDocsDir)) {
    if (entry !== homeDirName) {
      fs.rmSync(path.join(outputDocsDir, entry), {
        recursive: true,
        force: true,
      });
    }
  }
} else {
  fs.mkdirSync(outputDocsDir, { recursive: true });
}

const workspaces = fs
  .readdirSync(workspaceDir, { withFileTypes: true })
  .filter(dir => dir.isDirectory())
  .map(dir => dir.name);

for (const name of workspaces) {
  const wPath = path.join(workspaceDir, name);
  const docsPath = path.join(wPath, 'docs');
  const outPath = path.join(outputDocsDir, name);

  // copy docs to microsite dir
  if (fs.existsSync(docsPath)) {
    fs.cpSync(docsPath, outPath, { recursive: true });
    console.log(`Copied docs for ${name}`);
  }
}

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
import fs from 'fs';
import path from 'path';

const workspacesDir = path.resolve('workspaces');

function getWorkspaceDirs() {
  return fs.readdirSync(workspacesDir).filter(entry => {
    const dirPath = path.join(workspacesDir, entry);
    const bumpFile = path.join(dirPath, '.auto-version-bump');

    return fs.statSync(dirPath).isDirectory() && fs.existsSync(bumpFile);
  });
}

function batch(array) {
  const BATCH_SIZE = 10;
  const batchArray = [];

  for (let i = 0; i < array.length; i += BATCH_SIZE) {
    batchArray.push(array.slice(i, i + BATCH_SIZE));
  }

  return batchArray;
}

const workspaces = getWorkspaceDirs().sort();
const batches = batch(workspaces);

console.log(JSON.stringify({ batch: batches }));
/*
 * Copyright 2026 The Backstage Authors
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
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';

import { listWorkspaces } from './list-workspaces.js';

describe('list-workspaces', () => {
  const isDirectory = async filename =>
    fs.stat(filename).then(stat => stat.isDirectory());

  it('should return only workspace names by default', async () => {
    const result = await listWorkspaces();

    assert.ok(
      result.every(workspace => workspace === path.basename(workspace)),
    );
  });

  it('should return full paths with fullPath=true', async () => {
    const workspaces = await listWorkspaces({ fullPath: true });
    const result = await Promise.all(workspaces.map(isDirectory));

    assert.ok(result.every(isDir => isDir === true));
  });
});

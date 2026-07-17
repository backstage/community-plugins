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

import fs from 'fs';
import path from 'path';

/**
 * Guards the workspace-level README change for issue #4056.
 * Reads workspaces/quay/README.md (the file modified by this contribution).
 */
describe('workspaces/quay/README.md', () => {
  // src/__tests__ -> ../../../../ = workspaces/quay/
  const readmePath = path.join(__dirname, '../../../../README.md');
  const readme = fs.readFileSync(readmePath, 'utf8');

  it('replaces the default scaffolded boilerplate', () => {
    expect(readme).not.toContain(
      'This is your newly scaffolded Backstage App, Good Luck!',
    );
    expect(readme).toContain('Quay plugin for Backstage');
  });

  it('lists each Quay package with a link to its plugin README', () => {
    expect(readme).toContain('./plugins/quay/README.md');
    expect(readme).toContain('./plugins/quay-backend/README.md');
    expect(readme).toContain('./plugins/quay-actions/README.md');
    expect(readme).toContain('./plugins/quay-common/README.md');
  });

  it('includes a Quick start section with install guidance', () => {
    expect(readme).toContain('## Quick start');
    expect(readme).toContain('@backstage-community/plugin-quay');
    expect(readme).toContain('@backstage-community/plugin-quay-backend');
  });
});

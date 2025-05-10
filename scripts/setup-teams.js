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

const CONFIG_PATH = path.resolve('.github/plugin-teams.json');

const mockGitHubState = {
  'community-plugins-rbac': ['@christoph-jerolimov', 'unexpected_user'],
};

function readConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Config file not found at: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse JSON: ${err.message}`);
  }
  return null;
}

function syncTeams(config) {
  console.log(`Syncing community-plugins team creation from config:\n`);

  for (const team of config.teams) {
    const expectedMembers = team.members;
    const actualMembers = mockGitHubState[team.name] || [];

    console.log(`\nVerify or create team "${team.name}:"`);

    for (const user of expectedMembers) {
      if (!actualMembers.includes(user)) {
        console.log(`   ➕ Adding "${user}" to team "${team.name}"`);
      } else {
        console.log(`   ✅ "${user}" is already a member of "${team.name}"`);
      }
    }

    const extras = actualMembers.filter(u => !expectedMembers.includes(u));
    for (const user of extras) {
      console.log(
        `   ➖ Removing unexpected member "${user}" from team "${team.name}"`,
      );
    }
  }

  console.log(`\nFinished syncing teams with ${CONFIG_PATH}.`);
}

function main() {
  const config = readConfig(CONFIG_PATH);
  syncTeams(config);
}

main();

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
import { fileURLToPath } from 'url';
import semver from 'semver';
import { listWorkspaces } from './list-workspaces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// get latest stable Backstage release
async function getLatestBackstageVersion() {
  const response = await fetch(
    'https://versions.backstage.io/v1/tags/main/manifest.json',
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const manifest = await response.json();
  return manifest.releaseVersion;
}

// get all workspace versions
async function getWorkspaceVersions() {
  const workspaceNames = await listWorkspaces();
  const workspacesDir = path.join(__dirname, '..', 'workspaces');
  const workspaces = [];

  for (const workspaceName of workspaceNames) {
    const backstageJsonPath = path.join(
      workspacesDir,
      workspaceName,
      'backstage.json',
    );

    if (fs.existsSync(backstageJsonPath)) {
      try {
        const backstageJson = JSON.parse(
          fs.readFileSync(backstageJsonPath, 'utf8'),
        );
        if (backstageJson.version) {
          workspaces.push({
            name: workspaceName,
            version: backstageJson.version,
          });
        }
      } catch (error) {
        console.warn(
          `Warning: Could not read version from ${workspaceName}/backstage.json:`,
          error.message,
        );
      }
    }
  }

  return workspaces;
}

// calculate version difference
function getVersionDifference(currentVersion, latestVersion) {
  const current = semver.clean(currentVersion);
  const latest = semver.clean(latestVersion);

  if (!current || !latest) return 0;

  // if major versions differ, treat as significantly outdated
  if (semver.major(current) !== semver.major(latest)) {
    return semver.major(latest) > semver.major(current) ? 10 : 0;
  }

  return semver.minor(latest) - semver.minor(current);
}

// categorize workspaces by how outdated they are
function categorizeWorkspaces(workspaces, latestVersion) {
  const tiers = { tier1: [], tier2: [], tier3: [] };

  workspaces.forEach(workspace => {
    const versionDiff = getVersionDifference(workspace.version, latestVersion);
    if (versionDiff >= 3) tiers.tier1.push(workspace);
    else if (versionDiff === 2) tiers.tier2.push(workspace);
    else if (versionDiff === 1) tiers.tier3.push(workspace);
  });

  // sort each tier by workspace name
  Object.values(tiers).forEach(tier =>
    tier.sort((a, b) => a.name.localeCompare(b.name)),
  );

  return tiers;
}

// generate markdown summary for a tier
function generateTierSummary(count, emoji, title) {
  if (count === 0) return '';
  return `- ${emoji} ${title}: **${count}**\n`;
}

// generate markdown table for a tier
function generateTierTable(workspaces, emoji, title) {
  if (workspaces.length === 0) return '';

  let output = `## ${emoji} ${title}\n\n`;
  output += '| Workspace | Current Version |\n';
  output += '|-----------|-----------------|\n';
  workspaces.forEach(workspace => {
    output += `| ${workspace.name} | ${workspace.version} |\n`;
  });
  return `${output}\n`;
}

// generate the dashboard output
function generateDashboard(workspaces, tiers, latestVersion) {
  let output =
    'Tracking workspaces not on the latest Backstage minor version\n\n';
  output += `**Latest Version:** ${latestVersion}\n\n`;
  output += '---\n\n';

  const totalOutdated =
    tiers.tier1.length + tiers.tier2.length + tiers.tier3.length;
  if (totalOutdated === 0) {
    output += '## Summary: All workspaces are up to date! 🎉\n\n';
  } else {
    output += `## Summary: Outdated workspaces: ${totalOutdated}\n\n`;
  }
  const totalUpToDate = workspaces.length - totalOutdated;

  output += generateTierSummary(tiers.tier1.length, '🔴', '≥ 3 minor versions behind');
  output += generateTierSummary(tiers.tier2.length, '🟠', '2 minor versions behind');
  output += generateTierSummary(tiers.tier3.length, '🟡', '1 minor version behind');
  output += generateTierSummary(totalUpToDate, '🟢', 'up to date');
  output += '\n';

  output += generateTierTable(tiers.tier1, '🔴', '≥ 3 minor versions behind');
  output += generateTierTable(tiers.tier2, '🟠', '2 minor versions behind');
  output += generateTierTable(tiers.tier3, '🟡', '1 minor version behind');

  output += `*Dashboard generated on ${
    new Date().toISOString().split('T')[0]
  }*\n`;

  return output;
}

// main function
async function main() {
  const latestVersion = await getLatestBackstageVersion();
  const workspaces = await getWorkspaceVersions();
  const tiers = categorizeWorkspaces(workspaces, latestVersion);
  const dashboard = generateDashboard(workspaces, tiers, latestVersion);

  console.log(dashboard);
}

// run the script
main().catch(error => {
  console.error('Error generating dashboard:', error);
  process.exit(1);
});

export {
  getLatestBackstageVersion,
  getWorkspaceVersions,
  categorizeWorkspaces,
  generateDashboard,
};

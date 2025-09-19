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

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARCHIVED_FILE = path.join(
  __dirname,
  '..',
  '.github',
  'archived-plugins.json',
);
const ARCHIVED_WORKSPACES_FILE = path.join(
  __dirname,
  '..',
  'ARCHIVED_WORKSPACES.md',
);

// Configuration files that need workspace entries removed
const CONFIG_FILES = {
  LABELER: path.join(__dirname, '..', '.github', 'labeler.yml'),
  BUG_TEMPLATE: path.join(
    __dirname,
    '..',
    '.github',
    'ISSUE_TEMPLATE',
    '1-bug.yaml',
  ),
  FEATURE_TEMPLATE: path.join(
    __dirname,
    '..',
    '.github',
    'ISSUE_TEMPLATE',
    '2-feature.yaml',
  ),
  WORKSPACE_DROPDOWN: path.join(
    __dirname,
    '..',
    '.github',
    'ISSUE_TEMPLATE',
    'snippets',
    'workspaces-dropdown.yaml',
  ),
  CODEOWNERS: path.join(__dirname, '..', '.github', 'CODEOWNERS'),
  COMPATIBILITY: path.join(
    __dirname,
    '..',
    'docs',
    'compatibility',
    'compatibility.md',
  ),
  README: path.join(__dirname, '..', 'docs', 'README.md'),
};

async function appendToArchivedWorkspacesMd(entries) {
  console.log('Updating ARCHIVED_WORKSPACES.md...');

  const tableRows = entries.map(entry => {
    const workspace = entry.workspace;
    const packageName = entry.pluginName;
    const reason = entry.reason || 'No longer maintained';
    const sourceLink = `[${entry.gitTag}](https://github.com/backstage/community-plugins/tree/${entry.gitTag}/workspaces/${workspace})`;
    return `| ${workspace} | \`${packageName}\` | ${reason} | ${sourceLink} |`;
  });

  const newContent = `${tableRows.join('\n')}\n`;
  await fs.appendFile(ARCHIVED_WORKSPACES_FILE, newContent);

  console.log(`Added ${entries.length} entries to ARCHIVED_WORKSPACES.md`);
}

async function removeWorkspaceFromLabeler(workspace) {
  console.log(`Removing workspace/${workspace} from labeler.yml...`);
  const content = await fs.readFile(CONFIG_FILES.LABELER, 'utf8');

  const lines = content.split('\n');
  const filteredLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith(`workspace/${workspace}:`)) {
      // Skip this line and the following line as per labeler format
      i++;

      // Skip the following empty line if it exists
      if (i + 1 < lines.length && lines[i + 1].trim() === '') {
        i++;
      }
      continue;
    }

    filteredLines.push(line);
  }

  await fs.writeFile(CONFIG_FILES.LABELER, filteredLines.join('\n'));
  console.log('Updated labeler.yml');
}

async function removeWorkspaceFromIssueTemplate(filePath, workspace) {
  console.log(`Removing ${workspace} from ${path.basename(filePath)}...`);
  const content = await fs.readFile(filePath, 'utf8');

  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed !== `- ${workspace}`;
  });

  await fs.writeFile(filePath, filteredLines.join('\n'));
  console.log(`Updated ${path.basename(filePath)}`);
}

async function removeWorkspaceFromCodeowners(workspace) {
  console.log(`Removing /workspaces/${workspace} from CODEOWNERS...`);
  const content = await fs.readFile(CONFIG_FILES.CODEOWNERS, 'utf8');

  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    const workspacePattern = new RegExp(
      `^/workspaces/${workspace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s`,
    );
    return !workspacePattern.test(line);
  });

  await fs.writeFile(CONFIG_FILES.CODEOWNERS, filteredLines.join('\n'));
  console.log('Updated CODEOWNERS');
}

async function removeWorkspaceFromCompatibility(workspace) {
  console.log(`Removing ${workspace} from compatibility.md...`);
  const content = await fs.readFile(CONFIG_FILES.COMPATIBILITY, 'utf8');

  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    if (line.startsWith('| ')) {
      const workspacePattern = new RegExp(
        `/workspaces/${workspace.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        )}(\\)|%2F)`,
      );
      if (workspacePattern.test(line)) {
        return false;
      }
    }

    return true;
  });

  await fs.writeFile(CONFIG_FILES.COMPATIBILITY, filteredLines.join('\n'));
  console.log('Updated compatibility.md');
}

async function removeFromReadme(packages) {
  console.log(`Removing entries from docs/README.md...`);
  const content = await fs.readFile(CONFIG_FILES.README, 'utf8');

  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    if (!line.startsWith('| ')) {
      return true;
    }

    // Remove entries matching any of the package names
    for (const pkg of packages) {
      if (line.includes(pkg.name)) {
        return false;
      }
    }

    return true;
  });

  await fs.writeFile(CONFIG_FILES.README, filteredLines.join('\n'));
  console.log('Updated docs/README.md');
}

async function getPackagesFromWorkspace(workspace, targetPlugin = null) {
  const plugins = [];
  const pluginsDir = path.join(
    __dirname,
    '..',
    'workspaces',
    workspace,
    'plugins',
  );

  const pluginDirs = await fs.readdir(pluginsDir);

  for (const pluginDir of pluginDirs) {
    const pluginPath = path.join(pluginsDir, pluginDir);
    const stat = await fs.stat(pluginPath);

    if (!stat.isDirectory()) {
      continue;
    }

    const packageJsonPath = path.join(pluginPath, 'package.json');
    const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    if (packageData.name.startsWith('@backstage-community/')) {
      const pluginName = packageData.name.replace('@backstage-community/', '');

      // if a plugin specified, only process if plugin name matches
      if (targetPlugin && pluginName !== targetPlugin) {
        continue;
      }

      plugins.push({
        name: packageData.name,
        version: packageData.version,
        workspace,
        plugin: pluginDir,
      });
    }
  }

  return plugins;
}

async function addArchivedEntry(entries) {
  const content = await fs.readFile(ARCHIVED_FILE, 'utf8');
  const archivedData = JSON.parse(content);

  for (const entry of entries) {
    console.log(`Adding new entry for ${entry.pluginName}`);
    archivedData.archived.push(entry);
  }

  await fs.writeFile(ARCHIVED_FILE, JSON.stringify(archivedData, null, 2));
  console.log(`Updated ${ARCHIVED_FILE}`);
}

async function main() {
  try {
    const { positionals } = parseArgs({
      args: process.argv.slice(2),
      options: {
        help: {
          type: 'boolean',
          short: 'h',
        },
      },
      allowPositionals: true,
    });

    const workspace = positionals[0];
    let plugin = positionals[1];
    let reason = positionals[2] || 'No longer maintained';

    // If second argument looks like a reason (contains spaces), treat it as reason
    if (plugin && plugin.includes(' ')) {
      reason = plugin;
      plugin = null;
    }

    console.log(`Archiving workspace ${workspace}...`);
    console.log(`Reason: ${reason}`);

    // Get packages from workspace
    const packages = await getPackagesFromWorkspace(workspace, plugin);

    if (packages.length === 0) {
      console.log('No packages found to archive.');
      return;
    }

    const entries = packages.map(pkg => ({
      pluginName: pkg.name,
      version: pkg.version,
      workspace: pkg.workspace,
      plugin: pkg.plugin,
      gitTag: `${pkg.name}@${pkg.version}`,
      reason,
      archivedDate: new Date().toISOString().split('T')[0],
    }));

    await addArchivedEntry(entries);

    await appendToArchivedWorkspacesMd(entries);

    await removeFromReadme(packages);

    // For full workspace archival, also update other configuration files
    if (!plugin) {
      console.log(
        `\\nDetected full workspace archival - updating additional configuration files...`,
      );
      await removeWorkspaceFromLabeler(workspace);
      await removeWorkspaceFromIssueTemplate(
        CONFIG_FILES.BUG_TEMPLATE,
        workspace,
      );
      await removeWorkspaceFromIssueTemplate(
        CONFIG_FILES.FEATURE_TEMPLATE,
        workspace,
      );
      await removeWorkspaceFromIssueTemplate(
        CONFIG_FILES.WORKSPACE_DROPDOWN,
        workspace,
      );
      await removeWorkspaceFromCodeowners(workspace);
      await removeWorkspaceFromCompatibility(workspace);
      console.log('Successfully updated all configuration files');
    }

    console.log(`\nSuccessfully archived ${entries.length} package(s):`);
    entries.forEach(entry => {
      console.log(
        `  - ${entry.pluginName} (${entry.workspace}/${entry.plugin}) - Tag: ${entry.gitTag}`,
      );
    });
  } catch (error) {
    if (error.message.includes('parsing arguments')) {
      // Already handled above
      return;
    }
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

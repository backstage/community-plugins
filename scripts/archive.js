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

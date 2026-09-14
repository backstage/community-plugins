// .claude/skills/unmaintained-workspaces/scripts/list-unmaintained.cjs
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function parseVersion(version) {
  const parts = version.replace(/^v/, '').split('.').map(Number);
  return { major: parts[0], minor: parts[1], patch: parts[2] || 0 };
}

function minorVersionsBehind(current, latest) {
  const c = parseVersion(current);
  const l = parseVersion(latest);
  return (l.major - c.major) * 100 + (l.minor - c.minor);
}

function getLatestBackstageVersion() {
  const raw = execSync(
    'gh api repos/backstage/backstage/releases/latest --jq .tag_name',
    { encoding: 'utf8' },
  );
  return raw.trim().replace(/^v/, '');
}

function parseCodeowners(repoRoot) {
  const content = fs.readFileSync(
    path.resolve(repoRoot, '.github', 'CODEOWNERS'),
    'utf8',
  );
  const owners = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^\/workspaces\/([^\s/]+)\s+(.*)/);
    if (match) {
      const workspace = match[1];
      const ownerList = match[2]
        .split(/\s+/)
        .filter(
          o =>
            o.startsWith('@') &&
            o !== '@backstage/community-plugins-maintainers',
        );

      if (!owners[workspace]) {
        owners[workspace] = new Set();
      }
      for (const owner of ownerList) {
        owners[workspace].add(owner);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(owners).map(([k, v]) => [k, Array.from(v)]),
  );
}

function main() {
  const repoRoot = process.cwd();
  const args = process.argv.slice(2);

  const thresholdIdx = args.indexOf('--threshold');
  const threshold = thresholdIdx !== -1 ? Number(args[thresholdIdx + 1]) : 3;

  const workspaceIdx = args.indexOf('--workspace');
  const singleWorkspace = workspaceIdx !== -1 ? args[workspaceIdx + 1] : null;

  const latestVersion = getLatestBackstageVersion();
  const codeowners = parseCodeowners(repoRoot);

  const workspacesDir = path.resolve(repoRoot, 'workspaces');

  if (singleWorkspace) {
    const workspaceDir = path.resolve(workspacesDir, singleWorkspace);
    if (!fs.existsSync(workspaceDir)) {
      console.error(
        JSON.stringify({
          error: 'workspace_not_found',
          message: `Workspace '${singleWorkspace}' does not exist under workspaces/.`,
        }),
      );
      process.exit(1);
    }

    const backstageJsonPath = path.resolve(workspaceDir, 'backstage.json');
    if (!fs.existsSync(backstageJsonPath)) {
      console.error(
        JSON.stringify({
          error: 'no_backstage_json',
          message: `Workspace '${singleWorkspace}' has no backstage.json file.`,
        }),
      );
      process.exit(1);
    }

    const { version } = JSON.parse(fs.readFileSync(backstageJsonPath, 'utf8'));
    const behind = minorVersionsBehind(version, latestVersion);

    if (behind < threshold) {
      console.error(
        JSON.stringify({
          error: 'below_threshold',
          message: `Workspace '${singleWorkspace}' is only ${behind} version(s) behind (on ${version}, latest ${latestVersion}). Threshold is ${threshold}.`,
        }),
      );
      process.exit(1);
    }

    console.log(
      JSON.stringify(
        [
          {
            workspace: singleWorkspace,
            currentVersion: version,
            latestVersion,
            versionsBehind: behind,
            owners: codeowners[singleWorkspace] || [],
          },
        ],
        null,
        2,
      ),
    );
    return;
  }

  const workspaceNames = fs
    .readdirSync(workspacesDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  const results = [];

  for (const workspace of workspaceNames) {
    const backstageJsonPath = path.resolve(
      workspacesDir,
      workspace,
      'backstage.json',
    );
    try {
      const content = fs.readFileSync(backstageJsonPath, 'utf8');
      const { version } = JSON.parse(content);
      const behind = minorVersionsBehind(version, latestVersion);

      if (behind >= threshold) {
        results.push({
          workspace,
          currentVersion: version,
          latestVersion,
          versionsBehind: behind,
          owners: codeowners[workspace] || [],
        });
      }
    } catch {
      // Skip workspaces without backstage.json
    }
  }

  results.sort((a, b) => b.versionsBehind - a.versionsBehind);
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  main();
} else {
  module.exports = { parseVersion, minorVersionsBehind, parseCodeowners };
}

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const {
  getLastCommitDate,
  daysSince,
  fileExists,
  getHealthStatus,
} = require("./utils.cjs");

const WORKSPACES_DIR = path.join(process.cwd(), "workspaces");
const OUTPUT_DIR = path.join(process.cwd(), "plugin-health");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const report = [];

const workspaces = fs
  .readdirSync(WORKSPACES_DIR)
  .filter(d => fs.statSync(path.join(WORKSPACES_DIR, d)).isDirectory());

console.log(`🔍 Scanning ${workspaces.length} workspaces`);

for (const ws of workspaces) {
  const wsPath = path.join(WORKSPACES_DIR, ws);

  const lastCommit = getLastCommitDate(wsPath);
  const inactiveDays = daysSince(lastCommit);

  report.push({
    workspace: ws,
    lastCommit: lastCommit ? lastCommit.toISOString() : "unknown",
    daysSinceLastCommit: inactiveDays,
    hasReadme: fileExists(path.join(wsPath, "README.md")),
    hasCodeowners: fileExists(path.join(wsPath, "CODEOWNERS")),
    status: getHealthStatus(inactiveDays),
  });
}

// Write outputs
fs.writeFileSync(
  path.join(OUTPUT_DIR, "plugin-health-report.json"),
  JSON.stringify(report, null, 2)
);

const md = [
  "# Backstage Community Plugins – Health Report",
  "",
  `Generated on: ${new Date().toISOString()}`,
  "",
  "| Workspace | Last Commit | Days Inactive | README | CODEOWNERS | Status |",
  "|----------|------------|---------------|--------|------------|--------|",
];

for (const p of report) {
  md.push(
    `| ${p.workspace} | ${p.lastCommit} | ${p.daysSinceLastCommit} | ${
      p.hasReadme ? "✅" : "❌"
    } | ${p.hasCodeowners ? "✅" : "❌"} | ${
      p.status === "active"
        ? "🟢 Active"
        : p.status === "at-risk"
        ? "🟠 At Risk"
        : "⚪ Unknown"
    } |`
  );
}

fs.writeFileSync(
  path.join(OUTPUT_DIR, "plugin-health-report.md"),
  md.join("\n")
);

console.log("✅ Plugin health report generated");

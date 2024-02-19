import { GitUtils, PackageGraph } from "@backstage/cli-node";
import { getPackages } from "@manypkg/get-packages";
import chalk from "chalk";
import fs from "fs/promises";

export async function changedWorkspaces() {
  const changedFiles = await GitUtils.listChangedFiles("main");
  const workspaces = new Set();

  changedFiles.forEach((name) => {
    // First match with prefix = "workspaces/" & suffix = "/"
    const match = name.match("(?<=workspaces/)([^/]+)(?=/)");
    if (match && match[0]) {
      workspaces.add(match[0]);
    }
  });
  console.log("changed files", workspaces);
  // backstage-cli repo lint --since origin/master

  for (let workspace in workspaces) {
    const output = execSync(
      `npx --yes @backstage/create-app --path ${workspacePath} --skip-install`,
      { input: answers.name }
    );
  }
}

changedWorkspaces();

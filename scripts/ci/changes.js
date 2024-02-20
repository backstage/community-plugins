import { GitUtils } from "@backstage/cli-node";

const changedFiles = await GitUtils.listChangedFiles("origin/main");
const workspaces = new Set();

changedFiles.forEach((name) => {
  // First match with prefix = "workspaces/" & suffix = "/"
  const match = name.match("(?<=workspaces/)([^/]+)(?=/)");
  if (match && match[0]) {
    workspaces.add(match[0]);
  }
});

console.log(`out=${workspaces.values().next().value}`);

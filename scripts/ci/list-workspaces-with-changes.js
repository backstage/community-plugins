import { GitUtils } from "@backstage/cli-node";

const changedFiles = await GitUtils.listChangedFiles("origin/main");
const workspaces = new Set();

changedFiles.forEach((name) => {
  // First match starting with prefix = "workspaces/" & suffix = "/"
  const match = name.match("^workspaces/([^/]+)/");
  if (match && match[0]) {
    workspaces.add(match[0]);
  }
});

console.log(JSON.stringify(Array.from(workspaces)));

#!/usr/bin/env node

import { Octokit } from "@octokit/rest";
import { resolve as resolvePath } from "path";
import fs from "fs-extra";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const baseOptions = {
  owner: "backstage",
  repo: "community-plugins",
};

async function getPackageJson(filePath) {
  return await fs.readJson(resolvePath(filePath, "package.json"));
}

async function createGitTag(octokit, commitSha, tagName) {
  const annotatedTag = await octokit.git.createTag({
    ...baseOptions,
    tag: tagName,
    message: tagName,
    object: commitSha,
    type: "commit",
  });

  try {
    await octokit.git.createRef({
      ...baseOptions,
      ref: `refs/tags/${tagName}`,
      sha: annotatedTag.data.sha,
    });
  } catch (ex) {
    if (
      ex.status === 422 &&
      ex.response.data.message === "Reference already exists"
    ) {
      throw new Error(`Tag ${tagName} already exists in repository`);
    }
    console.error(`Tag creation for ${tagName} failed`);
    throw ex;
  }
}

async function main() {
  if (!process.env.WORKSPACE_NAME) {
    throw new Error("WORKSPACE_NAME environment variable not set");
  }
  if (!process.env.GITHUB_SHA) {
    throw new Error("GITHUB_SHA is not set");
  }
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not set");
  }

  const commitSha = process.env.GITHUB_SHA;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const repoRoot = resolvePath(__dirname, "..", "..");
  process.chdir(
    resolvePath(repoRoot, "workspaces", process.env.WORKSPACE_NAME)
  );

  const dirContents = await fs.readdir("./plugins", {
    withFileTypes: true,
  });

  for (const item of dirContents) {
    if (item.isDirectory()) {
      try {
        const { name, version } = await getPackageJson(
          resolvePath("./plugins", item.name)
        );
        const tagName = `${name}@${version}`;
        console.log(`Creating release tag ${tagName} at ${commitSha}`);
        await createGitTag(octokit, commitSha, tagName);
      } catch (error) {
        console.error(`Failed to create tag for ${item.name}:${error.message}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});

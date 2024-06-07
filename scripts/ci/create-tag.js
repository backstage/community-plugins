#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");
const path = require('path');
const fs = require("fs-extra");
const { EOL } = require("os");

const baseOptions = {
  owner: "backstage",
  repo: "community-plugins",
};

async function getCurrentTagVersion(filePath) {
  return fs.readJson(path.join(filePath,package.json)).then((_) => _.version);
}

async function getCurrentTagName(filePath) {
  return fs.readJson(path.join(filePath,package.json)).then((_) => _.name);
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
  if (!process.env.GITHUB_SHA) {
    throw new Error("GITHUB_SHA is not set");
  }
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not set");
  }
  if (!process.env.GITHUB_OUTPUT) {
    throw new Error("GITHUB_OUTPUT environment variable not set");
  }

  const commitSha = process.env.GITHUB_SHA;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const dirContents = await fs.readdir(path.join(__dirname,plugins), { withFileTypes: true });

  for (const item of dirContents) {
    if (item.isDirectory()) {
      const pluginName = await getCurrentTagName(path.join(__dirname,plugins,item.name));
      const pluginVersion = await getCurrentTagVersion(path.join(__dirname,plugins,item.name));
      const tagName = `plugin_${pluginName}@${pluginVersion}`;

      console.log(`Creating release tag ${tagName} at ${commitSha}`);
      await createGitTag(octokit, commitSha, tagName);

      await fs.appendFile(
        process.env.GITHUB_OUTPUT,
        `tag_name=${tagName}${EOL}`
      );
    }
  }
}

main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});

#!/usr/bin/env node
/* eslint-disable @backstage/no-undeclared-imports */
/*
 * Copyright 2020 The Backstage Authors
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

// This script is used to determine whether a particular commit has changes
// that should lead to a release. It is run as part of the main master build
// to determine whether the release flow should be run as well.
//
// It has the following output which can be used later in GitHub actions:
//
// needs_release = 'true' | 'false'

import { execFile as execFileCb } from "child_process";
import { promises as fs } from "fs";
import { promisify } from "util";
import { resolve as resolvePath } from "path";
import { EOL } from "os";

import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const parentRef = process.env.COMMIT_SHA_BEFORE || "HEAD^";

const execFile = promisify(execFileCb);

async function runPlain(cmd, ...args) {
  try {
    const { stdout } = await execFile(cmd, args, { shell: true });
    return stdout.trim();
  } catch (error) {
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }
    if (!error.code) {
      throw error;
    }
    throw new Error(
      `Command '${[cmd, ...args].join(" ")}' failed with code ${error.code}`
    );
  }
}

async function main() {
  if (!process.env.WORKSPACE_NAME) {
    throw new Error("WORKSPACE_NAME environment variable not set");
  }

  const repoRoot = resolvePath(__dirname, "..", "..");
  process.cwd(resolvePath(repoRoot, "workspaces", process.env.WORKSPACE_NAME));

  if (!process.env.GITHUB_OUTPUT) {
    throw new Error("GITHUB_OUTPUT environment variable not set");
  }

  const diff = await runPlain(
    "git",
    "diff",
    "--name-only",
    parentRef,
    "'*/package.json'" // Git treats this as what would usually be **/package.json
  );

  const workspacePackageJsonRegex = new RegExp(
    `^workspaces\/${process.env.WORKSPACE_NAME}\/(packages|plugins)\/[^/]+\/package\.json$`
  );
  const packageList = diff
    .split("\n")
    .filter((path) => path.match(workspacePackageJsonRegex));

  const packageVersions = await Promise.all(
    packageList.map(async (path) => {
      let name;
      let newVersion;
      let oldVersion;

      try {
        const data = JSON.parse(
          await runPlain("git", "show", `${parentRef}:${path}`)
        );
        name = data.name;
        oldVersion = data.version;
      } catch {
        oldVersion = "<none>";
      }

      try {
        const data = JSON.parse(
          await fs.readFile(resolvePath(repoRoot, path), "utf8")
        );
        name = data.name;
        newVersion = data.version;
      } catch (error) {
        if (error.code === "ENOENT") {
          newVersion = "<none>";
        }
      }

      return { name, oldVersion, newVersion };
    })
  );

  const newVersions = packageVersions.filter(
    ({ oldVersion, newVersion }) =>
      oldVersion !== newVersion &&
      oldVersion !== "<none>" &&
      newVersion !== "<none>"
  );

  if (newVersions.length === 0) {
    console.log("No package version bumps detected, no release needed");
    await fs.appendFile(process.env.GITHUB_OUTPUT, `needs_release=false${EOL}`);
    return;
  }

  console.log("Package version bumps detected, a new release is needed");
  const maxLength = Math.max(...newVersions.map((_) => _.name.length));
  for (const { name, oldVersion, newVersion } of newVersions) {
    console.log(
      `  ${name.padEnd(maxLength, " ")} ${oldVersion} to ${newVersion}`
    );
  }
  await fs.appendFile(process.env.GITHUB_OUTPUT, `needs_release=true${EOL}`);
}

main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});

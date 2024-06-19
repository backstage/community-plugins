/*
 * Copyright 2024 The Backstage Authors
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

import { execFile as execFileCb } from "child_process";
import { promises as fs } from "fs";
import { promisify } from "util";
import { resolve as resolvePath } from "path";
import { EOL } from "os";

import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const parentRef = process.env.COMMIT_SHA_BEFORE || "origin/main";

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
  if (!process.env.GITHUB_OUTPUT) {
    throw new Error("GITHUB_OUTPUT environment variable not set");
  }

  const repoRoot = resolvePath(__dirname, "..", "..");
  process.chdir(repoRoot);

  const diff = await runPlain("git", "diff", "--name-only", parentRef);

  const packageList = diff.split("\n");

  const workspaces = new Set(["noop"]);
  for (const path of packageList) {
    const match = path.match(/^workspaces\/([^/]+)\//);
    if (match) {
      workspaces.add(match[1]);
    }
  }

  console.log("workspaces found with changes:", Array.from(workspaces));

  for (const workspace of workspaces) {
    if (
      !(await fs
        .stat(`workspaces/${workspace}/package.json`)
        .catch(() => false))
    ) {
      workspaces.delete(workspace);
    }
  }

  console.log("workspaces that exist:", Array.from(workspaces));

  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `workspaces=${JSON.stringify(Array.from(workspaces))}${EOL}`
  );
}

main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});

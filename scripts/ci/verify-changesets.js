#!/usr/bin/env node
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

import { join } from "path";
import fs from "fs/promises";
import { default as parseChangeset } from "@changesets/parse";

const privatePackages = new Set([
  "app",
  "backend",
  "e2e-test",
  "storybook",
  "techdocs-cli-embedded-app",
]);

/**
 * Verify that changset do not include releases for private workspace packages
 *
 * Example for workspace "example": `node verify-changesets.js example`
 */
async function main() {
  if (process.argv.length < 3) {
    throw new Error("Usage: node verify-changesets.js name-of-the-workspace");
  }
  const workspace = process.argv[2];

  const changesetsFolderPath = join(
    import.meta.dirname,
    "..",
    "..",
    "workspaces",
    workspace,
    ".changeset"
  );
  const fileNames = await fs.readdir(changesetsFolderPath);
  const changesetNames = fileNames.filter(
    (name) => name.endsWith(".md") && name !== "README.md"
  );

  const changesets = await Promise.all(
    changesetNames.map(async (name) => {
      const content = await fs.readFile(
        join(changesetsFolderPath, name),
        "utf8"
      );
      return { name, ...parseChangeset(content) };
    })
  );

  const errors = [];
  for (const changeset of changesets) {
    const privateReleases = changeset.releases.filter((release) =>
      privatePackages.has(release.name)
    );
    if (privateReleases.length > 0) {
      const names = privateReleases
        .map((release) => `'${release.name}'`)
        .join(", ");
      errors.push({
        name: changeset.name,
        messages: [
          `Should not contain releases of the following packages since they are not published: ${names}`,
        ],
      });
    }
  }

  if (errors.length) {
    console.log();
    console.log("***********************************************************");
    console.log("*             Changeset verification failed!              *");
    console.log("***********************************************************");
    console.log();
    for (const error of errors) {
      console.error(`Changeset '${error.name}' is invalid:`);
      console.log();
      for (const message of error.messages) {
        console.error(`  ${message}`);
      }
    }
    console.log();
    console.log("***********************************************************");
    console.log();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});

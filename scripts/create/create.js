import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";
import { readFile, writeFile, cp } from "fs/promises";
import { join, resolve } from "path";

const answers = await inquirer.prompt([
  {
    type: "input",
    name: "name",
    message: chalk.blue("Name of the new workspace"),
    validate(value) {
      return (
        !!value.match(/^[a-z0-9\-]+$/) ||
        "Invalid input. Please enter lowercase letters, numbers, and dashes only."
      );
    },
  },
  {
    type: "input",
    name: "owners",
    message: chalk.blue("Name of the owner(s) of the workspace"),
    validate(value) {
      return (
        !!value.match(/@[a-zA-Z0-9_-]+/) ||
        "Invalid input. Please enter a valid GitHub handle or group preceded by '@'."
      );
    },
  },
]);

const workspacePath = join("workspaces", answers.name);
try {
  const output = execSync(
    `npx --yes @backstage/create-app --path ${workspacePath} --skip-install`,
    { input: answers.name }
  );
  console.log(output.toString());

  const file = await readFile(join(workspacePath, "package.json"), {
    encoding: "utf8",
  });
  const content = JSON.parse(file);

  const additionalDevDependencies = [
    "@changesets/cli",
    "@backstage/repo-tools",
  ];

  for (const additionalDependency of additionalDevDependencies) {
    const version = execSync(
      `npm show ${additionalDependency} version`
    ).toString();
    content.devDependencies[additionalDependency] = `^${version.trim()}`;
  }

  content.name = answers.name;

  await writeFile(
    join(workspacePath, "package.json"),
    JSON.stringify(content, null, 2)
  );

  // Experimental
  await cp(
    join(resolve(), "scripts/create/.changeset"),
    join(workspacePath, ".changeset"),
    {
      recursive: true,
    }
  );
} catch (error) {
  process.exit(1);
}

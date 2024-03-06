import path from "path";
import fs from "fs/promises";
import { spawnSync } from "child_process";

if (process.argv.length < 3) {
  throw new Error(`Usage: node publishing-needed.js <name-of-the-workspace>`);
}
const workspace = process.argv[2];

(async function main() {
  const pluginsFolderPath = path.join(
    import.meta.dirname,
    "..",
    "..",
    "workspaces",
    workspace,
    "plugins"
  );

  const packagesToBePublished = [];
  const plugins = await fs.readdir(pluginsFolderPath, { withFileTypes: true });
  for (const plugin of plugins) {
    if (!plugin.isDirectory()) {
      continue;
    }

    const packageJson = JSON.parse(
      await fs.readFile(
        path.join(pluginsFolderPath, plugin.name, "package.json"),
        "utf-8"
      )
    );

    const nameAndVersion = `${packageJson.name}@${packageJson.version}`;
    const result = spawnSync("npm", ["show", nameAndVersion]);
    if (result.status !== 0) {
      // package is missing
      packagesToBePublished.push(nameAndVersion);
    }
  }
  if (packagesToBePublished.length === 0) {
    console.log("All packages are present on npm, skipping publishing");
    process.exit(1);
  }
  console.log(
    `Publishing needed as the following packages are missing.\n ${packagesToBePublished.join(
      ","
    )}`
  );
})().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});

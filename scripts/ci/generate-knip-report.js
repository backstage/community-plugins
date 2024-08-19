import pLimit from "p-limit";
import os from "os";
import { resolve as resolvePath } from "path";
import fs from "fs-extra";
import { createBinRunner } from "./knip-util.js";
import * as url from "url";

// Ignore this due to Knip error: Error: ENAMETOOLONG: name too long, scandir
const ignoredPackages = ["packages/techdocs-cli-embedded-app"];

// for now generate reports for everything inside plugins
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolvePath(__dirname, "..", "..");

async function generateKnipConfig({ packageDir }) {
  const knipConfig = {
    entry: [
      "dev/index.{ts,tsx}",
      "src/index.{ts,tsx}",
      "src/alpha.{ts,tsx}",
      "src/routes.ts",
      "src/run.ts",
    ],
    jest: {
      entry: ["src/setupTests.ts", "**/*.test.{ts,tsx}"],
    },
    ignore: [
      ".eslintrc.js",
      "config.d.ts",
      "node_modules/**",
      "dist/**",
      "{fixtures,migrations,templates}/**",
    ],
    ignoreDependencies: [
      "@backstage/cli", // everything depends on this for its package.json commands
      "@backstage/theme", // this uses `declare module` in .d.ts so is implicitly used whenever extensions are needed
    ],
  };
  await fs.writeFile(
    `${packageDir}/knip.json`,
    JSON.stringify(knipConfig, null, 2)
  );
}

function cleanKnipConfig({ packageDir }) {
  if (fs.existsSync(`${packageDir}/knip.json`)) {
    fs.rmSync(`${packageDir}/knip.json`);
  }
}

async function handlePackage({ packageDir, knipDir}) {
  console.log(`## Processing ${packageDir}`);
  if (ignoredPackages.includes(packageDir)) {
    console.log(`Skipping ${packageDir}`);
    return;
  }
  const fullDir = resolvePath(repoRoot, "workspaces", packageDir, "plugins");

  const dirContents = await fs.readdir(fullDir, {
    withFileTypes: true,
  });

  for (const item of dirContents) {
    if (item.isDirectory()) {
      try {
        const currDirPath = resolvePath(fullDir, item.name);
        const reportPath = resolvePath(currDirPath, "knip-report.md");
        const run = createBinRunner(currDirPath, "");
        await generateKnipConfig({ packageDir: currDirPath });
        const report = await run(
          `${knipDir}/knip.js`,
          `--directory ${currDirPath}`, // Run in the package directory
          "--config knip.json",
          "--no-exit-code", // Removing this will end the process in case there are findings by knip
          "--no-progress", // Remove unnecessary debugging from output
          // TODO: Add more checks when dependencies start to look ok, see https://knip.dev/reference/cli#--include
          "--include dependencies,unlisted",
          "--reporter markdown"
        );

        cleanKnipConfig({ packageDir: currDirPath });

        const existingReport = await fs
          .readFile(reportPath, "utf8")
          .catch((error) => {
            if (error.code === "ENOENT") {
              return undefined;
            }
            throw error;
          });

        if (existingReport !== report) {
          console.warn(`Knip report changed for ${packageDir}/${item.name}`);
        }
        await fs.writeFile(reportPath, report);
      } catch (error) {
        console.error(
          `Failed to generate knip report for ${item.name}:${error.message}`
        );
      }
    }
  }
}


export async function runKnipReports({ packageDir }) {
  const knipDir = resolvePath(repoRoot, './node_modules/knip/bin/');
  const limiter = pLimit(os.cpus().length);

  try {
    await limiter(async () =>
      handlePackage({ packageDir, knipDir })
    );
  } catch (e) {
    console.log(
      `Error occurred during knip reporting: ${e}, cleaning knip configs`
    );

    const fullDir = resolvePath(repoRoot, 'workspaces', packageDir, 'plugins');

    try {
      const dirContents = await fs.readdir(fullDir, { withFileTypes: true });

      for (const item of dirContents) {
        if (item.isDirectory()) {
          const currDirPath = resolvePath(fullDir, item.name);
          await cleanKnipConfig({ packageDir: currDirPath });
        }
      }
    } catch (error) {
      console.error(`Failed to read directory or clean Knip config for ${packageDir}:`, error);
    }

    throw e;
  }
}
  async function main() {
    try {
      if (!process.env.WORKSPACE_NAME) {
        throw new Error("WORKSPACE_NAME environment variable not set");
      }
      await runKnipReports({ packageDir: process.env.WORKSPACE_NAME});
      console.log('Knip reports generated successfully');
    } catch (error) {
      console.error('Failed to generate Knip reports:', error);
    }
  }


main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});
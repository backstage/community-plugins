// This script generates a knip-report.md for all workspaces

import { resolve as resolvePath } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import url from 'url';
import { promisify } from 'util';

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolvePath(__dirname, "..", "..");

const execAsync = promisify(exec);

async function handlePackage() {
    const rootDirPath = resolvePath(repoRoot, "workspaces");
  
    const dirContents = await fs.readdir(rootDirPath, {
      withFileTypes: true,
    });
  
    for (const item of dirContents) {
      if (item.isDirectory()) {
        const packageDir = item.name;
        const fullDir = resolvePath(repoRoot, "workspaces", packageDir);
        
        try {
          console.log(`Processing directory: ${fullDir}`);

          // Run `yarn add knip`
          await execAsync('yarn add knip', { cwd: fullDir });
          console.log(`Added knip in ${fullDir}`);

          // Run `yarn backstage-repo-tools knip-reports`
          await execAsync('yarn backstage-repo-tools knip-reports', { cwd: fullDir });
          console.log(`Ran knip-reports in ${fullDir}`);

        } catch (error) {
          console.error(`Error processing ${fullDir}:`, error.message);
        }
      }
    }
}

handlePackage().catch(error => {
  console.error("Error in handlePackage:", error.message);
});

  
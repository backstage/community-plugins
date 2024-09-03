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
import { Project } from 'ts-morph';
import { BackstagePackage, BackstagePackageJson } from '@backstage/cli-node';
import fs from 'fs-extra';
import path from 'path';
import { getPackages } from '@manypkg/get-packages';

function readPackageJson(pkg: string) {
  return JSON.parse(fs.readFileSync(path.join(pkg, 'package.json'), 'utf-8'));
}

export async function lint(paths: string[]) {
  if (paths.length > 0) {
    for (const dir of paths) {
      await lintPath(dir);
    }
  } else {
    console.log('No workspace or package path provided');
  }
}

async function lintPath(pkgPath: string) {
  const pkgs = await getPackages(pkgPath);
  const backendPackages = pkgs.packages.filter((pkg: BackstagePackage) => {
    return (
      pkg.packageJson.backstage?.role === 'backend-plugin' ||
      pkg.packageJson.backstage?.role === 'backend-plugin-module'
    );
  });
  backendPackages.forEach(pkg =>
    verifyIndex(pkg.dir, pkgs.rootDir, pkg.packageJson),
  );
}

async function verifyIndex(
  pkg: string,
  rootPath: string,
  packageJson?: BackstagePackageJson,
) {
  console.log(`Verifying ${packageJson?.name}`);
  const project = new Project({
    tsConfigFilePath: path.join(rootPath, 'tsconfig.json'),
  });
  const tsPath = path.join(pkg, 'src/index.ts');
  const sourceFile = project.getSourceFile(tsPath);
  if (!sourceFile) {
    console.log(`Could not find ${tsPath}`);
    process.exit(1);
  }
  const symbols = sourceFile?.getExportSymbols();

  const exportCount = symbols?.length || 0;
  if (exportCount > 1) {
    console.log(
      `   ⚠️ Warning: ${exportCount} exports found, ${symbols
        .map(symbol => symbol.getName())
        .join(', ')}`,
    );
  }

  const createRouterExport = symbols?.find(
    symbol => symbol.getName() === 'createRouter',
  );

  if (!sourceFile.getDefaultExportSymbol()) {
    console.log('   ❌ Missing default export');
  }
  let createRouterDeprecated = undefined;
  if (createRouterExport) {
    createRouterDeprecated = createRouterExport
      .getJsDocTags()
      .find(tag => tag.getName() === 'deprecated');
  }

  if (createRouterExport) {
    console.log('   ❌ createRouter is exported');
    if (!createRouterDeprecated)
      console.log('   ❌ createRouter is NOT deprecated');
  }

  const pkgJson = packageJson ?? readPackageJson(pkg);
  if (
    '@backstage/backend-common' in pkgJson.dependencies ||
    '@backstage/backend-common' in pkgJson.devDependencies
  ) {
    console.log('   ❌ Stop depending on @backstage/backend-common');
  }

  if (
    '@backstage/backend-tasks' in pkgJson.dependencies ||
    '@backstage/backend-tasks' in pkgJson.devDependencies
  ) {
    console.log('   ❌ Stop depending on @backstage/backend-tasks');
  }
}

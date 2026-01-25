#!/usr/bin/env node
/*
 * Copyright 2025 The Backstage Authors
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

/**
 * Community Plugins MUI to BUI Migration Analytics Script
 *
 * Analyzes MUI to @backstage/ui migration progress across all workspace plugins
 * in the Backstage Community Plugins repository using TypeScript AST parsing.
 *
 * Features:
 * - Discovers all workspace plugins
 * - Tracks per-workspace migration progress
 * - Discovers all components from import statements
 * - Tracks component usage through AST traversal
 * - Handles complex import patterns (aliases, destructuring, etc.)
 * - Generates workspace-level and aggregate statistics
 */

const fs = require('fs');
const path = require('path');
const { Project } = require('ts-morph');

// Configuration
const CONFIG = {
  // File extensions to analyze
  extensions: ['.tsx', '.ts', '.jsx', '.js'],

  // Directories to ignore
  ignoreDirs: [
    'node_modules',
    'dist',
    'dist-types',
    'dist-storybook',
    'build',
    '.git',
    'coverage',
    'test-results',
    'e2e-test-report',
    '.yarn',
    'docs-ui',
    'microsite',
  ],

  // Excluded workspaces (same as list-workspaces.js)
  excludedWorkspaces: ['noop', 'repo-tools'],

  // MUI import patterns to track
  muiPatterns: {
    '@material-ui/core': 'MUI v4 Core',
    '@material-ui/lab': 'MUI v4 Lab',
    '@material-ui/icons': 'MUI v4 Icons',
    '@material-ui/pickers': 'MUI v4 Pickers',
    '@mui/material': 'MUI v5 Material',
    '@mui/lab': 'MUI v5 Lab',
    '@mui/icons-material': 'MUI v5 Icons',
    '@mui/styles': 'MUI v5 Styles',
  },

  // Backstage UI patterns to track
  backstagePatterns: {
    '@backstage/ui': 'Backstage UI',
  },
};

class CommunityPluginsMigrationAnalyzer {
  constructor() {
    this.scriptDir = path.dirname(__filename);
    this.repoRoot = this.findRepoRoot();

    this.results = {
      summary: {
        totalWorkspaces: 0,
        totalFiles: 0,
        filesWithMUI: 0,
        filesWithBackstageUI: 0,
        totalImports: 0,
        muiImports: 0,
        backstageImports: 0,
        totalComponents: 0,
      },
      byLibrary: {},
      componentUsage: {},
      discoveredComponents: new Set(),
      recommendations: [],
      migrationProgress: {
        fullyMigrated: 0,
        partiallyMigrated: 0,
        notStarted: 0,
        mixed: 0,
      },
      workspaces: [], // Per-workspace results
    };
  }

  findRepoRoot() {
    let currentDir = this.scriptDir;

    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf-8'),
          );

          if (
            packageJson.name === '@backstage-community/plugins' ||
            (packageJson.repository &&
              packageJson.repository.includes('community-plugins'))
          ) {
            return currentDir;
          }
        } catch {
          // Continue searching if package.json is malformed
        }
      }

      currentDir = path.dirname(currentDir);
    }

    console.warn('⚠️  Could not find repository root, using fallback path');
    return path.resolve(this.scriptDir, '../..');
  }

  async listWorkspaces() {
    const workspacesDir = path.join(this.repoRoot, 'workspaces');

    if (!fs.existsSync(workspacesDir)) {
      throw new Error(`Workspaces directory not found: ${workspacesDir}`);
    }

    const workspaces = fs
      .readdirSync(workspacesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => !CONFIG.excludedWorkspaces.includes(name))
      .sort();

    return workspaces;
  }

  async analyze(quiet = false, specificWorkspace = null) {
    if (!quiet) {
      console.log(`🔍 Community Plugins MUI to BUI Migration Analytics`);
      console.log(`===============================================`);
      console.log('');
    }

    // Get list of workspaces
    const allWorkspaces = await this.listWorkspaces();
    const workspacesToAnalyze = specificWorkspace
      ? allWorkspaces.filter(w => w === specificWorkspace)
      : allWorkspaces;

    if (specificWorkspace && workspacesToAnalyze.length === 0) {
      throw new Error(`Workspace not found: ${specificWorkspace}`);
    }

    this.results.summary.totalWorkspaces = workspacesToAnalyze.length;

    if (!quiet) {
      console.log(
        `📦 Found ${workspacesToAnalyze.length} workspace${
          workspacesToAnalyze.length === 1 ? '' : 's'
        } to analyze`,
      );
      console.log('');
    }

    // Analyze each workspace
    for (const workspace of workspacesToAnalyze) {
      if (!quiet) {
        console.log(
          `📂 Analyzing workspace: ${workspace} (${
            workspacesToAnalyze.indexOf(workspace) + 1
          }/${workspacesToAnalyze.length})`,
        );
      }

      const workspacePath = path.join(this.repoRoot, 'workspaces', workspace);
      const workspaceResult = await this.analyzeWorkspace(
        workspace,
        workspacePath,
        quiet,
      );
      this.results.workspaces.push(workspaceResult);

      if (!quiet) {
        console.log(
          `   ✓ Completed (${workspaceResult.summary.filesWithMUI} MUI files, ${workspaceResult.summary.filesWithBackstageUI} BUI files)`,
        );
        console.log('');
      }
    }

    this.aggregateResults();
    this.calculateMigrationProgress();
    this.generateRecommendations();

    return this.results;
  }

  async analyzeWorkspace(workspaceName, workspacePath, quiet = false) {
    const workspaceResult = {
      name: workspaceName,
      path: path.relative(this.repoRoot, workspacePath),
      summary: {
        totalFiles: 0,
        filesWithMUI: 0,
        filesWithBackstageUI: 0,
        muiImports: 0,
        backstageImports: 0,
        components: 0,
      },
      migrationStatus: 'not-started',
      fileDetails: [],
      componentUsage: {},
    };

    if (!fs.existsSync(workspacePath)) {
      if (!quiet) console.warn(`   ⚠️  Workspace not found: ${workspacePath}`);
      return workspaceResult;
    }

    // Create ts-morph project for this workspace
    const tsconfigPath = path.join(workspacePath, 'tsconfig.json');
    const project = new Project({
      tsConfigFilePath: fs.existsSync(tsconfigPath) ? tsconfigPath : undefined,
      skipAddingFilesFromTsConfig: true,
    });

    // Find all relevant files in the workspace
    const files = [];
    const packagesDir = path.join(workspacePath, 'packages');
    const pluginsDir = path.join(workspacePath, 'plugins');

    if (fs.existsSync(packagesDir)) {
      files.push(...this.findRelevantFiles(packagesDir));
    }
    if (fs.existsSync(pluginsDir)) {
      files.push(...this.findRelevantFiles(pluginsDir));
    }

    // If no packages or plugins dirs, analyze entire workspace
    if (files.length === 0) {
      files.push(...this.findRelevantFiles(workspacePath));
    }

    workspaceResult.summary.totalFiles = files.length;

    // Only analyze TypeScript files
    const tsFiles = files.filter(
      file => file.endsWith('.ts') || file.endsWith('.tsx'),
    );

    if (tsFiles.length === 0) {
      return workspaceResult;
    }

    // Process files in batches
    const batchSize = 100;
    for (let i = 0; i < tsFiles.length; i += batchSize) {
      const batch = tsFiles.slice(i, i + batchSize);

      try {
        const sourceFiles = batch
          .map(filePath => {
            try {
              return project.addSourceFileAtPath(filePath);
            } catch {
              if (!quiet) {
                console.warn(
                  `   ⚠️  Could not parse ${path.relative(
                    workspacePath,
                    filePath,
                  )}`,
                );
              }
              return null;
            }
          })
          .filter(Boolean);

        // Analyze each source file
        for (const sourceFile of sourceFiles) {
          const fileAnalysis = this.analyzeSourceFileWithAST(
            sourceFile,
            workspacePath,
            workspaceName,
          );
          if (
            fileAnalysis &&
            (fileAnalysis.imports.mui.length > 0 ||
              fileAnalysis.imports.backstage.length > 0)
          ) {
            workspaceResult.fileDetails.push(fileAnalysis);
            this.updateWorkspaceSummary(workspaceResult, fileAnalysis);

            // Track component usage per workspace
            Object.keys(fileAnalysis.components).forEach(component => {
              if (!workspaceResult.componentUsage[component]) {
                workspaceResult.componentUsage[component] = 0;
              }
              workspaceResult.componentUsage[component] +=
                fileAnalysis.components[component];
            });
          }
        }

        // Clear files from memory
        sourceFiles.forEach(sf => sf.forget());
      } catch (error) {
        if (!quiet)
          console.warn(`   ⚠️  Error processing batch: ${error.message}`);
      }
    }

    // Determine workspace migration status
    this.determineWorkspaceMigrationStatus(workspaceResult);

    workspaceResult.summary.components = Object.keys(
      workspaceResult.componentUsage,
    ).length;

    return workspaceResult;
  }

  analyzeSourceFileWithAST(sourceFile, workspaceRoot, workspaceName) {
    try {
      const filePath = sourceFile.getFilePath();
      const relativePath = path.relative(workspaceRoot, filePath);

      const fileAnalysis = {
        path: relativePath,
        workspace: workspaceName,
        imports: {
          mui: [],
          backstage: [],
        },
        components: {},
        migrationStatus: 'not-started',
      };

      // Analyze imports using AST
      this.analyzeImportsWithAST(sourceFile, fileAnalysis);

      // Analyze component usage using AST
      this.analyzeComponentUsageWithAST(sourceFile, fileAnalysis);

      // Determine migration status
      this.determineMigrationStatus(fileAnalysis);

      return fileAnalysis;
    } catch (error) {
      console.warn(
        `⚠️  Could not analyze file with AST: ${sourceFile.getFilePath()} - ${
          error.message
        }`,
      );
      return null;
    }
  }

  analyzeImportsWithAST(sourceFile, fileAnalysis) {
    const importDeclarations = sourceFile.getImportDeclarations();

    importDeclarations.forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();

      // Check if it's a MUI import
      for (const [muiPackage, description] of Object.entries(
        CONFIG.muiPatterns,
      )) {
        if (
          moduleSpecifier === muiPackage ||
          moduleSpecifier.startsWith(`${muiPackage}/`)
        ) {
          const importInfo = {
            package: muiPackage,
            path: moduleSpecifier,
            statement: importDecl.getText().trim(),
            description,
            namedImports: [],
            defaultImport: null,
          };

          // Extract named imports
          const namedImports = importDecl.getNamedImports();
          namedImports.forEach(namedImport => {
            const name = namedImport.getName();
            const alias = namedImport.getAliasNode()?.getText();
            importInfo.namedImports.push({ name, alias });
          });

          // Extract default import
          const defaultImport = importDecl.getDefaultImport();
          if (defaultImport) {
            importInfo.defaultImport = defaultImport.getText();
          }

          fileAnalysis.imports.mui.push(importInfo);

          if (!this.results.byLibrary[muiPackage]) {
            this.results.byLibrary[muiPackage] = { count: 0, files: new Set() };
          }
          this.results.byLibrary[muiPackage].count++;
          this.results.byLibrary[muiPackage].files.add(
            `${fileAnalysis.workspace}/${fileAnalysis.path}`,
          );
        }
      }

      // Check if it's a Backstage UI import
      for (const [backstagePackage, description] of Object.entries(
        CONFIG.backstagePatterns,
      )) {
        if (
          moduleSpecifier === backstagePackage ||
          moduleSpecifier.startsWith(`${backstagePackage}/`)
        ) {
          const importInfo = {
            package: backstagePackage,
            path: moduleSpecifier,
            statement: importDecl.getText().trim(),
            description,
            namedImports: [],
            defaultImport: null,
          };

          // Extract named imports
          const namedImports = importDecl.getNamedImports();
          namedImports.forEach(namedImport => {
            const name = namedImport.getName();
            const alias = namedImport.getAliasNode()?.getText();
            importInfo.namedImports.push({ name, alias });
          });

          // Extract default import
          const defaultImport = importDecl.getDefaultImport();
          if (defaultImport) {
            importInfo.defaultImport = defaultImport.getText();
          }

          fileAnalysis.imports.backstage.push(importInfo);

          if (!this.results.byLibrary[backstagePackage]) {
            this.results.byLibrary[backstagePackage] = {
              count: 0,
              files: new Set(),
            };
          }
          this.results.byLibrary[backstagePackage].count++;
          this.results.byLibrary[backstagePackage].files.add(
            `${fileAnalysis.workspace}/${fileAnalysis.path}`,
          );
        }
      }
    });
  }

  analyzeComponentUsageWithAST(sourceFile, fileAnalysis) {
    const { SyntaxKind } = require('ts-morph');

    // Get all imported component names (including aliases) with their source library
    const componentNames = new Map(); // name -> { alias, isMUI }

    fileAnalysis.imports.mui.forEach(importInfo => {
      // Add named imports from MUI
      importInfo.namedImports.forEach(({ name, alias }) => {
        componentNames.set(name, { alias: alias || name, isMUI: true });
      });

      // Add default import from MUI
      if (importInfo.defaultImport) {
        componentNames.set(importInfo.defaultImport, {
          alias: importInfo.defaultImport,
          isMUI: true,
        });
      }
    });

    fileAnalysis.imports.backstage.forEach(importInfo => {
      // Add named imports from Backstage UI
      importInfo.namedImports.forEach(({ name, alias }) => {
        componentNames.set(name, { alias: alias || name, isMUI: false });
      });

      // Add default import from Backstage UI
      if (importInfo.defaultImport) {
        componentNames.set(importInfo.defaultImport, {
          alias: importInfo.defaultImport,
          isMUI: false,
        });
      }
    });

    // Find JSX elements
    const jsxElements = [
      ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement),
      ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ];

    // Count usage of each component
    componentNames.forEach((componentInfo, originalName) => {
      let count = 0;

      jsxElements.forEach(element => {
        let tagName;

        if (element.getKind() === SyntaxKind.JsxElement) {
          tagName = element.getOpeningElement().getTagNameNode().getText();
        } else if (element.getKind() === SyntaxKind.JsxSelfClosingElement) {
          tagName = element.getTagNameNode().getText();
        }

        if (tagName === componentInfo.alias) {
          count++;
        }
      });

      if (count > 0) {
        fileAnalysis.components[originalName] = count;

        // Track components by name AND library to avoid mixing MUI and BUI components
        const componentKey = componentInfo.isMUI
          ? `${originalName} (MUI)`
          : `${originalName} (BUI)`;

        if (!this.results.componentUsage[componentKey]) {
          this.results.componentUsage[componentKey] = {
            total: 0,
            files: [],
            isMUI: componentInfo.isMUI,
            originalName: originalName,
          };
        }
        this.results.componentUsage[componentKey].total += count;
        this.results.componentUsage[componentKey].files.push({
          path: `${fileAnalysis.workspace}/${fileAnalysis.path}`,
          count: count,
          workspace: fileAnalysis.workspace,
        });

        this.results.discoveredComponents.add(componentKey);
      }
    });
  }

  findRelevantFiles(dir, files = []) {
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!CONFIG.ignoreDirs.includes(item) && !item.startsWith('.')) {
          this.findRelevantFiles(fullPath, files);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (CONFIG.extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  determineMigrationStatus(fileAnalysis) {
    const hasMUI = fileAnalysis.imports.mui.length > 0;
    const hasBackstage = fileAnalysis.imports.backstage.length > 0;

    if (!hasMUI && !hasBackstage) {
      fileAnalysis.migrationStatus = 'not-applicable';
    } else if (hasMUI && hasBackstage) {
      fileAnalysis.migrationStatus = 'mixed';
    } else if (hasBackstage && !hasMUI) {
      fileAnalysis.migrationStatus = 'fully-migrated';
    } else if (hasMUI && !hasBackstage) {
      fileAnalysis.migrationStatus = 'not-started';
    }
  }

  determineWorkspaceMigrationStatus(workspaceResult) {
    const hasMUI = workspaceResult.summary.filesWithMUI > 0;
    const hasBackstage = workspaceResult.summary.filesWithBackstageUI > 0;

    if (!hasMUI && !hasBackstage) {
      workspaceResult.migrationStatus = 'not-applicable';
    } else if (hasMUI && hasBackstage) {
      workspaceResult.migrationStatus = 'mixed';
    } else if (hasBackstage && !hasMUI) {
      workspaceResult.migrationStatus = 'fully-migrated';
    } else if (hasMUI && !hasBackstage) {
      workspaceResult.migrationStatus = 'not-started';
    }
  }

  updateWorkspaceSummary(workspaceResult, fileAnalysis) {
    if (fileAnalysis.imports.mui.length > 0) {
      workspaceResult.summary.filesWithMUI++;
      workspaceResult.summary.muiImports += fileAnalysis.imports.mui.length;
    }

    if (fileAnalysis.imports.backstage.length > 0) {
      workspaceResult.summary.filesWithBackstageUI++;
      workspaceResult.summary.backstageImports +=
        fileAnalysis.imports.backstage.length;
    }
  }

  aggregateResults() {
    this.results.workspaces.forEach(workspace => {
      this.results.summary.totalFiles += workspace.summary.totalFiles;
      this.results.summary.filesWithMUI += workspace.summary.filesWithMUI;
      this.results.summary.filesWithBackstageUI +=
        workspace.summary.filesWithBackstageUI;
      this.results.summary.muiImports += workspace.summary.muiImports;
      this.results.summary.backstageImports +=
        workspace.summary.backstageImports;
    });

    this.results.summary.totalImports =
      this.results.summary.muiImports + this.results.summary.backstageImports;
    this.results.summary.totalComponents =
      this.results.discoveredComponents.size;
  }

  calculateMigrationProgress() {
    this.results.workspaces.forEach(workspace => {
      switch (workspace.migrationStatus) {
        case 'fully-migrated':
          this.results.migrationProgress.fullyMigrated++;
          break;
        case 'mixed':
          this.results.migrationProgress.mixed++;
          break;
        case 'not-started':
          this.results.migrationProgress.notStarted++;
          break;
        default:
          // not-applicable workspaces are not counted
          break;
      }
    });
  }

  generateRecommendations() {
    const recommendations = [];
    const totalRelevantWorkspaces =
      this.results.migrationProgress.fullyMigrated +
      this.results.migrationProgress.mixed +
      this.results.migrationProgress.notStarted;

    // Migration progress
    if (totalRelevantWorkspaces > 0) {
      const migrationRate =
        (this.results.migrationProgress.fullyMigrated /
          totalRelevantWorkspaces) *
        100;

      recommendations.push({
        priority: 'INFO',
        type: 'migration-progress',
        message: `Migration progress: ${migrationRate.toFixed(
          1,
        )}% of workspaces fully migrated to Backstage UI`,
        data: {
          rate: migrationRate,
          workspaces: totalRelevantWorkspaces,
        },
      });
    }

    // High-priority MUI v4 migrations
    const muiV4Workspaces = this.results.workspaces.filter(w =>
      w.fileDetails.some(f =>
        f.imports.mui.some(imp => imp.package.includes('@material-ui')),
      ),
    );

    if (muiV4Workspaces.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'mui-v4-upgrade',
        message: `${muiV4Workspaces.length} workspaces still use MUI v4 (@material-ui). These should be prioritized for migration.`,
        data: {
          workspaces: muiV4Workspaces.map(w => w.name),
        },
      });
    }

    // Mixed imports - quick wins
    if (this.results.migrationProgress.mixed > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'mixed-imports',
        message: `${this.results.migrationProgress.mixed} workspaces have mixed imports. Focus on completing these migrations first for quick wins.`,
      });
    }

    // Top components that could be migrated
    const topComponents = Object.entries(this.results.componentUsage)
      .filter(([, data]) => data.isMUI)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10);

    if (topComponents.length > 0) {
      recommendations.push({
        priority: 'INFO',
        type: 'top-components',
        message: 'Most frequently used MUI components across all workspaces:',
        data: topComponents.map(([name, data]) => ({
          component: name,
          usage: data.total,
          workspaces: [...new Set(data.files.map(f => f.workspace))].length,
        })),
      });
    }

    this.results.recommendations = recommendations;
  }

  generateReport() {
    const report = [];

    // Header
    report.push('🔍 Community Plugins MUI to BUI Migration Report');
    report.push('==============================================');
    report.push('');
    report.push(
      'Analyzing migration from MUI to @backstage/ui across all workspace plugins',
    );
    report.push('');

    // Summary
    report.push('📊 SUMMARY');
    report.push('-'.repeat(20));
    report.push(`Total workspaces: ${this.results.summary.totalWorkspaces}`);
    report.push(`Total files analyzed: ${this.results.summary.totalFiles}`);
    report.push(`Files with MUI imports: ${this.results.summary.filesWithMUI}`);
    report.push(
      `Files with Backstage UI imports: ${this.results.summary.filesWithBackstageUI}`,
    );
    report.push(
      `Total import statements: ${this.results.summary.totalImports}`,
    );
    report.push(`Components found: ${this.results.summary.totalComponents}`);
    report.push('');

    // Migration Progress
    const totalRelevantWorkspaces =
      this.results.migrationProgress.fullyMigrated +
      this.results.migrationProgress.mixed +
      this.results.migrationProgress.notStarted;

    if (totalRelevantWorkspaces > 0) {
      const fullyPct = (
        (this.results.migrationProgress.fullyMigrated /
          totalRelevantWorkspaces) *
        100
      ).toFixed(1);
      const mixedPct = (
        (this.results.migrationProgress.mixed / totalRelevantWorkspaces) *
        100
      ).toFixed(1);
      const notStartedPct = (
        (this.results.migrationProgress.notStarted / totalRelevantWorkspaces) *
        100
      ).toFixed(1);

      report.push('🚀 MIGRATION PROGRESS');
      report.push('-'.repeat(20));
      report.push(
        `✅ Fully migrated: ${this.results.migrationProgress.fullyMigrated} workspaces (${fullyPct}%)`,
      );
      report.push(
        `🔄 Mixed imports: ${this.results.migrationProgress.mixed} workspaces (${mixedPct}%)`,
      );
      report.push(
        `❌ Not started: ${this.results.migrationProgress.notStarted} workspaces (${notStartedPct}%)`,
      );
      report.push('');
    }

    // Per-workspace status
    report.push('📦 WORKSPACE STATUS');
    report.push('-'.repeat(20));

    // Sort by priority: not-started (most MUI files), mixed, fully-migrated
    const sortedWorkspaces = [...this.results.workspaces]
      .filter(w => w.migrationStatus !== 'not-applicable')
      .sort((a, b) => {
        if (
          a.migrationStatus === 'not-started' &&
          b.migrationStatus !== 'not-started'
        )
          return -1;
        if (
          a.migrationStatus !== 'not-started' &&
          b.migrationStatus === 'not-started'
        )
          return 1;
        if (
          a.migrationStatus === 'mixed' &&
          b.migrationStatus === 'fully-migrated'
        )
          return -1;
        if (
          a.migrationStatus === 'fully-migrated' &&
          b.migrationStatus === 'mixed'
        )
          return 1;
        return b.summary.filesWithMUI - a.summary.filesWithMUI;
      });

    sortedWorkspaces.slice(0, 20).forEach(workspace => {
      let statusIcon = '❌';
      if (workspace.migrationStatus === 'fully-migrated') {
        statusIcon = '✅';
      } else if (workspace.migrationStatus === 'mixed') {
        statusIcon = '🔄';
      }
      report.push(
        `${statusIcon} ${workspace.name}: ${workspace.summary.filesWithMUI} MUI files, ${workspace.summary.filesWithBackstageUI} BUI files`,
      );
    });

    if (sortedWorkspaces.length > 20) {
      report.push(`... and ${sortedWorkspaces.length - 20} more workspaces`);
    }
    report.push('');

    // Library Usage
    if (Object.keys(this.results.byLibrary).length > 0) {
      report.push('📚 LIBRARY USAGE');
      report.push('-'.repeat(20));
      Object.entries(this.results.byLibrary).forEach(([lib, data]) => {
        report.push(
          `${lib}: ${data.count} imports in ${data.files.size} files`,
        );
      });
      report.push('');
    }

    // Top Components
    const topComponents = Object.entries(this.results.componentUsage)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 15);

    if (topComponents.length > 0) {
      report.push('🔧 TOP COMPONENTS BY USAGE');
      report.push('-'.repeat(20));
      topComponents.forEach(([component, data], index) => {
        const workspaceCount = [...new Set(data.files.map(f => f.workspace))]
          .length;
        report.push(
          `${index + 1}. ${component}: ${
            data.total
          } usages across ${workspaceCount} workspace${
            workspaceCount === 1 ? '' : 's'
          }`,
        );
      });
      report.push('');
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      report.push('💡 RECOMMENDATIONS');
      report.push('-'.repeat(20));
      this.results.recommendations.forEach(rec => {
        let priority = '🔵'; // Default for INFO
        if (rec.priority === 'HIGH') {
          priority = '🔴';
        } else if (rec.priority === 'MEDIUM') {
          priority = '🟡';
        }
        report.push(`${priority} ${rec.message}`);

        if (rec.data && Array.isArray(rec.data)) {
          rec.data.forEach(item => {
            if (item.component) {
              report.push(
                `   - ${item.component}: ${item.usage} usages across ${
                  item.workspaces
                } workspace${item.workspaces === 1 ? '' : 's'}`,
              );
            }
          });
        }

        report.push('');
      });
    }

    // Export options
    report.push('💾 DATA EXPORT');
    report.push('-'.repeat(20));
    report.push('Run with --json flag to export detailed data in JSON format');
    report.push(
      'Run with --csv flag to export component usage data in CSV format',
    );
    report.push(
      'Run with --markdown flag to export GitHub-optimized markdown report',
    );
    report.push(
      'Run with --workspace <name> flag to analyze a specific workspace',
    );
    report.push('');

    return report.join('\n');
  }

  generateMarkdown() {
    const md = [];
    const now = new Date().toISOString().split('T')[0];

    // Calculate percentages
    const totalRelevantWorkspaces =
      this.results.migrationProgress.fullyMigrated +
      this.results.migrationProgress.mixed +
      this.results.migrationProgress.notStarted;

    const fullyPct =
      totalRelevantWorkspaces > 0
        ? (
            (this.results.migrationProgress.fullyMigrated /
              totalRelevantWorkspaces) *
            100
          ).toFixed(1)
        : '0.0';
    const mixedPct =
      totalRelevantWorkspaces > 0
        ? (
            (this.results.migrationProgress.mixed / totalRelevantWorkspaces) *
            100
          ).toFixed(1)
        : '0.0';
    const notStartedPct =
      totalRelevantWorkspaces > 0
        ? (
            (this.results.migrationProgress.notStarted /
              totalRelevantWorkspaces) *
            100
          ).toFixed(1)
        : '0.0';

    // Calculate overall migration progress (across all files)
    const totalMuiAndBuiFiles =
      this.results.summary.filesWithMUI +
      this.results.summary.filesWithBackstageUI;
    const overallProgress =
      totalMuiAndBuiFiles > 0
        ? (
            (this.results.summary.filesWithBackstageUI / totalMuiAndBuiFiles) *
            100
          ).toFixed(1)
        : '0.0';

    // Progress Bar
    const barLength = 50;
    const progressCount = Math.round(
      (parseFloat(overallProgress) / 100) * barLength,
    );
    const remainingCount = barLength - progressCount;

    // Migration Status Overview
    md.push(`## 🚀 Migration Status Overview`);
    md.push('');
    md.push(
      'This issue tracks the progress of migrating from Material-UI to `@backstage/ui` components across all workspace plugins in the Community Plugins repository.',
    );
    md.push('');
    md.push('```');
    md.push(
      `${'█'.repeat(progressCount)}${'░'.repeat(
        remainingCount,
      )} ${overallProgress}% Complete`,
    );
    md.push('```');
    md.push('');
    md.push('| Status | Workspaces | Percentage |');
    md.push('|--------|------------|------------|');
    md.push(
      `| ✅ Fully Migrated | ${this.results.migrationProgress.fullyMigrated} | ${fullyPct}% |`,
    );
    md.push(
      `| 🔄 Mixed (Partial) | ${this.results.migrationProgress.mixed} | ${mixedPct}% |`,
    );
    md.push(
      `| ❌ Not Started | ${this.results.migrationProgress.notStarted} | ${notStartedPct}% |`,
    );
    md.push('');

    // Per-Workspace Status
    md.push(`## 📦 Per-Workspace Status`);
    md.push('');

    // Sort workspaces by priority
    const sortedWorkspaces = [...this.results.workspaces]
      .filter(w => w.migrationStatus !== 'not-applicable')
      .sort((a, b) => {
        if (
          a.migrationStatus === 'not-started' &&
          b.migrationStatus !== 'not-started'
        )
          return -1;
        if (
          a.migrationStatus !== 'not-started' &&
          b.migrationStatus === 'not-started'
        )
          return 1;
        if (
          a.migrationStatus === 'mixed' &&
          b.migrationStatus === 'fully-migrated'
        )
          return -1;
        if (
          a.migrationStatus === 'fully-migrated' &&
          b.migrationStatus === 'mixed'
        )
          return 1;
        return b.summary.filesWithMUI - a.summary.filesWithMUI;
      });

    if (sortedWorkspaces.length > 0) {
      md.push(
        '| Workspace | Total Files | MUI Files | BUI Files | Status | Progress |',
      );
      md.push(
        '|-----------|-------------|-----------|-----------|--------|----------|',
      );

      sortedWorkspaces.forEach(workspace => {
        let statusIcon = '❌';
        if (workspace.migrationStatus === 'fully-migrated') {
          statusIcon = '✅';
        } else if (workspace.migrationStatus === 'mixed') {
          statusIcon = '🔄';
        }

        // Calculate progress
        const totalRelevantFiles =
          workspace.summary.filesWithMUI +
          workspace.summary.filesWithBackstageUI;
        const progress =
          totalRelevantFiles > 0
            ? Math.round(
                (workspace.summary.filesWithBackstageUI / totalRelevantFiles) *
                  100,
              )
            : 0;

        const progressBar =
          '█'.repeat(Math.floor(progress / 10)) +
          '░'.repeat(10 - Math.floor(progress / 10));

        md.push(
          `| \`${workspace.name}\` | ${workspace.summary.totalFiles} | ${workspace.summary.filesWithMUI} | ${workspace.summary.filesWithBackstageUI} | ${statusIcon} | ${progressBar} ${progress}% |`,
        );
      });
      md.push('');
    }

    // Priority Workspaces
    const priorityWorkspaces = sortedWorkspaces
      .filter(
        w =>
          w.migrationStatus === 'not-started' || w.migrationStatus === 'mixed',
      )
      .slice(0, 20);

    if (priorityWorkspaces.length > 0) {
      md.push(`## 🎯 Priority Workspaces`);
      md.push('');
      md.push(
        'These workspaces should be prioritized for migration (sorted by number of MUI files):',
      );
      md.push('');
      priorityWorkspaces.forEach((workspace, index) => {
        md.push(
          `${index + 1}. **${workspace.name}** - ${
            workspace.summary.filesWithMUI
          } files with MUI imports`,
        );
      });
      md.push('');
    }

    // Component Usage - split by MUI vs BUI
    const muiComponents = Object.entries(this.results.componentUsage)
      .filter(([, data]) => data.isMUI)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 20);

    const buiComponents = Object.entries(this.results.componentUsage)
      .filter(([, data]) => !data.isMUI)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 20);

    if (muiComponents.length > 0) {
      md.push(`## 🔧 Top 20 MUI Components (Need Migration)`);
      md.push('');
      md.push('| Rank | Component | Usage Count | Workspaces |');
      md.push('|------|-----------|-------------|------------|');
      muiComponents.forEach(([component, data], index) => {
        const workspaceCount = [...new Set(data.files.map(f => f.workspace))]
          .length;
        md.push(
          `| ${index + 1} | \`${component}\` | ${
            data.total
          } | ${workspaceCount} |`,
        );
      });
      md.push('');
    }

    if (buiComponents.length > 0) {
      md.push(`## ✅ Top 20 Backstage UI Components (Migrated)`);
      md.push('');
      md.push('| Rank | Component | Usage Count | Workspaces |');
      md.push('|------|-----------|-------------|------------|');
      buiComponents.forEach(([component, data], index) => {
        const workspaceCount = [...new Set(data.files.map(f => f.workspace))]
          .length;
        md.push(
          `| ${index + 1} | \`${component}\` | ${
            data.total
          } | ${workspaceCount} |`,
        );
      });
      md.push('');
    }

    // Recommendations
    const highPriority = this.results.recommendations.filter(
      r => r.priority === 'HIGH',
    );
    const mediumPriority = this.results.recommendations.filter(
      r => r.priority === 'MEDIUM',
    );

    const hasRecommendations =
      highPriority.length > 0 || mediumPriority.length > 0;

    if (hasRecommendations) {
      md.push(`## 💡 Recommendations`);
      md.push('');

      if (highPriority.length > 0) {
        md.push(`### 🔴 High Priority`);
        md.push('');
        highPriority.forEach(rec => {
          md.push(`- ${rec.message}`);
          if (rec.data && rec.data.workspaces) {
            md.push(
              `  - Affected workspaces: ${rec.data.workspaces
                .slice(0, 10)
                .join(', ')}${
                rec.data.workspaces.length > 10
                  ? `, and ${rec.data.workspaces.length - 10} more`
                  : ''
              }`,
            );
          }
        });
        md.push('');
      }

      if (mediumPriority.length > 0) {
        md.push(`### 🟡 Medium Priority`);
        md.push('');
        mediumPriority.forEach(rec => {
          md.push(`- ${rec.message}`);
        });
        md.push('');
      }
    }

    // Library Usage Breakdown
    if (Object.keys(this.results.byLibrary).length > 0) {
      md.push(`## 📚 Library Usage Breakdown`);
      md.push('');
      md.push('| Library | Import Count | Files |');
      md.push('|---------|--------------|-------|');
      Object.entries(this.results.byLibrary)
        .sort(([, a], [, b]) => b.count - a.count)
        .forEach(([lib, data]) => {
          md.push(`| \`${lib}\` | ${data.count} | ${data.files.size} |`);
        });
      md.push('');
    }

    // Detailed Statistics
    md.push(`## 📊 Detailed Statistics`);
    md.push('');
    md.push('| Metric | Count |');
    md.push('|--------|-------|');
    md.push(
      `| Total Workspaces Analyzed | ${this.results.summary.totalWorkspaces} |`,
    );
    md.push(`| Total Files Analyzed | ${this.results.summary.totalFiles} |`);
    md.push(
      `| Files with MUI Imports | ${this.results.summary.filesWithMUI} |`,
    );
    md.push(
      `| Files with Backstage UI Imports | ${this.results.summary.filesWithBackstageUI} |`,
    );
    md.push(
      `| Unique Components Found | ${this.results.summary.totalComponents} |`,
    );
    md.push('');

    // Footer
    md.push('---');
    md.push('');
    md.push(
      '_This report is automatically generated by the [Community Plugins MUI to BUI Migration Analytics Script](../../scripts/mui-to-bui/community-plugins-migration-analytics.js)_',
    );
    md.push('');
    md.push(`**Last Updated:** ${now}`);

    return md.join('\n');
  }

  exportJSON() {
    // Convert Sets to Arrays for JSON serialization
    const exportData = { ...this.results };
    Object.keys(exportData.byLibrary).forEach(lib => {
      exportData.byLibrary[lib].files = Array.from(
        exportData.byLibrary[lib].files,
      );
    });

    exportData.discoveredComponents = Array.from(
      this.results.discoveredComponents,
    );

    return JSON.stringify(exportData, null, 2);
  }

  exportCSV() {
    const rows = [
      [
        'Component',
        'Total Usage',
        'Workspaces Count',
        'Is MUI',
        'Example Workspaces',
      ],
    ];

    Object.entries(this.results.componentUsage)
      .sort(([, a], [, b]) => b.total - a.total)
      .forEach(([component, data]) => {
        const workspaces = [...new Set(data.files.map(f => f.workspace))];
        const exampleWorkspaces = workspaces.slice(0, 3).join('; ');
        rows.push([
          component,
          data.total,
          workspaces.length,
          data.isMUI ? 'Yes' : 'No',
          exampleWorkspaces,
        ]);
      });

    return rows.map(row => row.join(',')).join('\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes('--json');
  const csvFlag = args.includes('--csv');
  const markdownFlag = args.includes('--markdown');
  const helpFlag = args.includes('--help') || args.includes('-h');

  const workspaceIndex = args.indexOf('--workspace');
  const specificWorkspace =
    workspaceIndex !== -1 && args[workspaceIndex + 1]
      ? args[workspaceIndex + 1]
      : null;

  if (helpFlag) {
    console.log(`
🔍 Community Plugins MUI to BUI Migration Analytics

This script uses TypeScript AST parsing to analyze migration progress from
Material-UI to @backstage/ui components across all workspace plugins in the
Backstage Community Plugins repository.

Features:
🔍 TypeScript AST parsing for accurate analysis
🎯 Component discovery from import statements
📝 Handles complex import patterns (aliases, destructuring, etc.)
⚡ Reliable component usage tracking
📦 Per-workspace migration tracking
📊 GitHub-optimized markdown reports

Usage: node scripts/mui-to-bui/community-plugins-migration-analytics.js [options]

Options:
  --json               Export detailed results as JSON
  --csv                Export component usage as CSV
  --markdown           Generate GitHub-optimized markdown (for issue updates)
  --workspace <name>   Analyze specific workspace only
  --help, -h           Show this help message

Examples:
  node scripts/mui-to-bui/community-plugins-migration-analytics.js
  node scripts/mui-to-bui/community-plugins-migration-analytics.js --json
  node scripts/mui-to-bui/community-plugins-migration-analytics.js --markdown > report.md
  node scripts/mui-to-bui/community-plugins-migration-analytics.js --workspace argocd

The script will automatically:
1. Discover all workspace plugins in /workspaces
2. Use TypeScript AST parsing to analyze imports
3. Find all components from import statements
4. Generate comprehensive per-workspace and aggregate reports
5. Provide recommendations for migration priorities
    `);
    return;
  }

  const analyzer = new CommunityPluginsMigrationAnalyzer();

  try {
    const useQuiet = jsonFlag || csvFlag || markdownFlag;
    await analyzer.analyze(useQuiet, specificWorkspace);

    if (jsonFlag) {
      console.log(analyzer.exportJSON());
    } else if (csvFlag) {
      console.log(analyzer.exportCSV());
    } else if (markdownFlag) {
      console.log(analyzer.generateMarkdown());
    } else {
      console.log(analyzer.generateReport());
    }
  } catch (error) {
    console.error('❌ Error running migration analysis:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for testing
if (require.main === module) {
  main();
} else {
  module.exports = { CommunityPluginsMigrationAnalyzer, CONFIG };
}

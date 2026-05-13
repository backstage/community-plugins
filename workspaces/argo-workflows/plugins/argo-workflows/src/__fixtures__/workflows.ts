/*
 * Copyright 2026 The Backstage Authors
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

import type { Workflow } from '@backstage-community/plugin-argo-workflows-common';
import succeededData from './succeeded-workflow.json';
import runningData from './running-workflow.json';
import failedData from './failed-workflow.json';
import errorData from './error-workflow.json';
import pendingData from './pending-workflow.json';
import lintCheckData from './lint-check-workflow.json';
import e2eTestsData from './e2e-tests-workflow.json';
import dockerBuildData from './docker-build-workflow.json';
import dbMigrationData from './db-migration-workflow.json';
import securityScanData from './security-scan-workflow.json';

/** A succeeded workflow with a complete DAG of 4 nodes. */
export const succeededWorkflow: Workflow = succeededData as Workflow;

/** A currently running workflow with some nodes completed and one in progress. */
export const runningWorkflow: Workflow = runningData as Workflow;

/** A failed workflow where the deploy step encountered an error. */
export const failedWorkflow: Workflow = failedData as Workflow;

/** A workflow in error state (infrastructure issue). */
export const errorWorkflow: Workflow = errorData as Workflow;

/** A pending workflow that hasn't started yet. */
export const pendingWorkflow: Workflow = pendingData as Workflow;

/** A succeeded lint check workflow. */
export const lintCheckWorkflow: Workflow = lintCheckData as Workflow;

/** A failed E2E test workflow. */
export const e2eTestsWorkflow: Workflow = e2eTestsData as Workflow;

/** A currently running Docker build workflow. */
export const dockerBuildWorkflow: Workflow = dockerBuildData as Workflow;

/** A succeeded database migration workflow. */
export const dbMigrationWorkflow: Workflow = dbMigrationData as Workflow;

/** A security scan workflow that errored out. */
export const securityScanWorkflow: Workflow = securityScanData as Workflow;

/** All fixture workflows as a list, useful for the list view. */
export const allWorkflows: Workflow[] = [
  succeededWorkflow,
  runningWorkflow,
  failedWorkflow,
  errorWorkflow,
  pendingWorkflow,
  lintCheckWorkflow,
  e2eTestsWorkflow,
  dockerBuildWorkflow,
  dbMigrationWorkflow,
  securityScanWorkflow,
];

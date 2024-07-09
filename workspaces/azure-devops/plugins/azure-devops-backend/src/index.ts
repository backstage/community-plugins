/*
 * Copyright 2021 The Backstage Authors
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
 * Azure DevOps backend plugin that contains the API for retrieving builds, pull requests, etc. which is used by the Azure DevOps frontend plugin.
 *
 * @packageDocumentation
 */

export { AzureDevOpsApi } from './api';
export * from './service/router';
export { azureDevOpsPlugin as default } from './plugin';
/**
 * @deprecated Use `@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor` instead,
 * see {@link https://github.com/awanlin/community-plugins/tree/main/workspaces/azure-devops/plugins/catalog-backend-module-azure-devops-annotator-processor}
 */
export { AzureDevOpsAnnotatorProcessor } from './processor';

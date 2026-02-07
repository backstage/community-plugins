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

/**
 * A Backstage backend plugin that integrates towards n8n
 *
 * @packageDocumentation
 */

export { n8nPlugin as default } from './plugin';
export { createRouter } from './service/router';
export type { RouterOptions } from './service/router';
export { N8nApi } from './service/n8nApi';
export type {
  N8nWorkflow,
  N8nExecution,
  N8nWorkflowListResponse,
  N8nExecutionListResponse,
} from './types';

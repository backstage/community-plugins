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
import type { Config } from '@backstage/config';

import type { OpenAPIConfig } from '../../../../generated/now/table';

/**
 * Update the OpenAPIConfig with the ServiceNow configuration
 *
 * @param {OpenAPIConfig} OpenAPI - The OpenAPIConfig to update
 * @param {Config} config - The ServiceNow configuration to use
 */
export function updateOpenAPIConfig(
  OpenAPI: OpenAPIConfig,
  config: Config,
): void {
  OpenAPI.BASE = config.getString('servicenow.baseUrl');
  OpenAPI.USERNAME = config.getString('servicenow.username');
  OpenAPI.PASSWORD = config.getString('servicenow.password');
}

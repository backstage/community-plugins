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

import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';

/**
 * Configuration interface for the GitHub FairwindsInsights Plugin.
 */
export interface Config {
  /** Configuration options for the GitHub FairwindsInsights Plugin */
  fairwindsInsights?: {
    /**
     * Schedule definition for the GitHub FairwindsInsights Plugin tasks.
     */
    schedule?: SchedulerServiceTaskScheduleDefinition;
    /**
     * The name of the GitHub enterprise.
     */
    enterprise?: string;
    /**
     * The name of the GitHub organization.
     */
    organization?: string;
    /**
     * The host for GitHub FairwindsInsights integration.
     */
    host: string;
  };
}

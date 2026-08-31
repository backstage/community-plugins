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

import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';

/**
 * Configuration interface for the GitHub Copilot Plugin.
 */
export interface Config {
  /** Configuration options for the GitHub Copilot Plugin */
  copilot?: {
    /**
     * Schedule definition for the GitHub Copilot Plugin tasks.
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
     * The host for GitHub Copilot integration.
     */
    host: string;
    /**
     * Earliest date to ingest for v2. Must be >= '2025-10-10' (GitHub API limit).
     * On first run the task backfills every calendar day from this date to yesterday.
     * @default '2025-10-10'
     */
    backfillFromDate?: string;
    /**
     * Milliseconds to wait between per-day requests during backfill.
     * Increase if you encounter GitHub API rate limits.
     * @default 200
     */
    backfillDelayMs?: number;
    /**
     * Opt-in to ingesting per-user and team membership metrics (users-1-day and
     * user-teams-1-day reports). Required for team-level filtering in the UI.
     * Increases storage and ingestion time.
     * @default false
     */
    ingestTeams?: boolean;
  };
}

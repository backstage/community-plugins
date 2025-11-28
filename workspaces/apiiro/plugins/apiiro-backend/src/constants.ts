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
export const APIIRO_DEFAULT_TIMEOUT_MS = 60000; // Increased to 60 seconds for slower API responses
export const APIIRO_DEFAULT_PAGE_LIMIT = '1000';

// Repository cache configuration
export const REPOSITORY_CACHE_REFRESH_INTERVAL_MINUTES = 60; // How often to refresh the cache
export const REPOSITORY_CACHE_REFRESH_TIMEOUT_MINUTES = 5; // Timeout for cache refresh operation

// Apiiro API endpoint paths
export const APIIRO_REPOSITORIES_PATH = '/rest-api/v2/repositories';
export const APIIRO_RISKS_PATH = '/rest-api/v2/risks';
export const APIIRO_MTTR_PATH = '/rest-api/v1/risks-statistics/mttr';
export const APIIRO_RISK_SCORE_OVER_TIME_PATH =
  '/rest-api/v1/risks-statistics/risk-score-over-time';
export const APIIRO_SLA_BREACH_PATH =
  '/rest-api/v1/risks-statistics/sla-breach';
export const APIIRO_TOP_RISKS_PATH = '/rest-api/v1/risks-statistics/top-risks';
export const APIIRO_FILTER_OPTIONS_PATH =
  '/rest-api/v1/internal/connectors/backstage/filterOptions';

// Backend router endpoint paths
export const ROUTER_PATH_REPOSITORIES = '/repositories';
export const ROUTER_PATH_RISKS = '/risks';
export const ROUTER_PATH_MTTR_STATISTICS = '/mttr-statistics';
export const ROUTER_PATH_RISK_SCORE_OVER_TIME = '/risk-score-over-time';
export const ROUTER_PATH_SLA_BREACH = '/sla-breach';
export const ROUTER_PATH_TOP_RISKS = '/top-risks';
export const ROUTER_PATH_FILTER_OPTIONS = '/filterOptions';
export const ROUTER_PATH_HEALTH = '/health';

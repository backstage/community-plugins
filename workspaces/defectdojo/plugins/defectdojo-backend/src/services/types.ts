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
export interface DefectDojoProduct {
  id: number;
  name: string;
  description?: string;
  created?: string;
  updated?: string;
}

export interface DefectDojoEngagement {
  id: number;
  name: string;
  product: number;
  target_start: string;
  target_end: string;
  status: string;
  active: boolean;
}

export interface Finding {
  id: number;
  title: string;
  severity?: string;
  url?: string;
  description?: string;
  cwe?: number;
  product?: string;
  engagement?: string;
  date?: string;
  test?: {
    id: number;
    engagement: number;
    title?: string;
  };
  active?: boolean;
  verified?: boolean;
  false_p?: boolean;
  duplicate?: boolean;
  out_of_scope?: boolean;
  risk_acceptance_set?: any[];
  created?: string;
  last_reviewed?: string;
  mitigated?: string;
  impact?: string;
  steps_to_reproduce?: string;
  mitigation?: string;
  references?: string;
  numerical_severity?: string;
}

export interface FindingResponse {
  total: number;
  findings: ProcessedFinding[];
  tookMs: number;
}

export interface ProcessedFinding {
  id: number;
  title: string;
  severity: string;
  url?: string;
  description: string;
  cwe: number;
  product: string;
  engagement: string;
  created?: string;
}

export interface DefectDojoConfig {
  baseUrl: string;
  token: string;
  requestTimeoutMs?: number;
  maxPages?: number;
}

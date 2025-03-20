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
import {
  ACSCheckResults,
  ACSImageScanResult,
  EnterpriseContractPolicy,
  EnterpriseContractResult,
  transformECResult,
} from '@aonic-ui/pipelines';
import {
  PipelineRun,
  PipelineRunLogStep,
  RunStatus,
} from '../types/pipelinerun';
import { cleanLogs, extractJSON, extractPipelineSteps } from '../utils/logs';
import { isEmpty, isNumber } from 'lodash';

export class PipelineRunResult {
  /**
   * Underlying data structure
   */
  data: PipelineRun;
  constructor(data: PipelineRun) {
    this.data = data;
  }

  get id(): string {
    // Check if the value is a number as zero would handled as falsy
    // fallback to displayName
    return isNumber(this.data?.id)
      ? this.data.id
      : this.data?.displayName || 'N/A';
  }

  get type(): string {
    return this?.tpaLink ? 'Promote' : 'Build';
  }

  get status(): RunStatus {
    return this.data?.status || RunStatus.Unknown;
  }

  get logs(): string {
    return cleanLogs(this.data?.logs || '');
  }

  get critical(): number | string {
    return this.acsImageScanResult?.result?.summary?.CRITICAL ?? 'N/A';
  }

  get important(): number | string {
    return this.acsImageScanResult?.result?.summary?.IMPORTANT ?? 'N/A';
  }

  get moderate(): number | string {
    return this.acsImageScanResult?.result?.summary?.MODERATE ?? 'N/A';
  }

  get low(): number | string {
    return this.acsImageScanResult?.result?.summary?.LOW ?? 'N/A';
  }

  get enterpriseContractPolicies(): EnterpriseContractPolicy[] | undefined {
    const data = extractJSON(
      this.logs,
      'EC_EYECATCHER_BEGIN',
      'EC_EYECATCHER_END',
    ) as EnterpriseContractResult;
    return transformECResult(data ?? {});
  }

  get acsImageScanResult(): ACSImageScanResult | undefined {
    return extractJSON(
      this.logs,
      'ACS_IMAGE_SCAN_EYECATCHER_BEGIN',
      'ACS_IMAGE_SCAN_EYECATCHER_END',
    ) as ACSImageScanResult;
  }

  get acsImageCheckResults(): ACSCheckResults | undefined {
    return extractJSON(
      this.logs,
      'ACS_IMAGE_CHECK_EYECATCHER_BEGIN',
      'ACS_IMAGE_CHECK_EYECATCHER_END',
    ) as ACSCheckResults;
  }

  get acsDeploymentCheckResults(): ACSCheckResults | undefined {
    return extractJSON(
      this.logs,
      'ACS_DEPLOY_EYECATCHER_BEGIN',
      'ACS_DEPLOY_EYECATCHER_END',
    ) as ACSCheckResults;
  }

  get hasNoScanResults(): boolean {
    return [
      this.enterpriseContractPolicies,
      this.acsImageScanResult,
      this.acsImageCheckResults,
      this.acsDeploymentCheckResults,
    ].every(value => isEmpty(value));
  }

  get steps(): PipelineRunLogStep[] {
    return extractPipelineSteps(this.logs) || [];
  }

  get hasSteps(): boolean {
    return this.steps.length > 0;
  }

  stepLogs(step: string): string {
    const found = this.steps.filter(v => v.name === step);
    // it could be found with undefind logs. Fallback on empty string
    return found ? found[0]?.logs ?? '' : '';
  }

  get tpaLink(): string {
    const link = extractJSON(
      this.logs,
      'TPA_SBOM_URL_EYECATCHER_BEGIN',
      'TPA_SBOM_URL_EYECATCHER_END',
    );
    return link?.TPA_SBOM_URL;
  }

  get isBuild(): boolean {
    return this.type === 'Build';
  }
}

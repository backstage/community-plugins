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
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  HelpOutline as HelpOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { PFColors } from '../styles/PfColors';
import { HealthAnnotationType } from './HealthAnnotation';
import type { ToleranceConfig } from './ServerConfig';

export interface HealthItem {
  status: Status;
  title: string;
  text?: string;
  children?: HealthSubItem[];
}

export interface HealthItemConfig {
  status: Status;
  title: string;
  text?: string;
  value: number;
  threshold?: ToleranceConfig;
}

export interface HealthSubItem {
  status: Status;
  text: string;
  value?: number;
}

export interface WorkloadStatus {
  name: string;
  desiredReplicas: number;
  currentReplicas: number;
  availableReplicas: number;
  syncedProxies: number;
}

export interface AppHealthResponse {
  workloadStatuses: WorkloadStatus[];
  requests: RequestHealth;
}

export interface WorkloadHealthResponse {
  workloadStatus: WorkloadStatus;
  requests: RequestHealth;
}

export const TRAFFICSTATUS = 'Traffic Status';

/*
RequestType interface
- where the structure is type {<protocol>: {<code>:value ...} ...}

Example: { "http": {"200": 2, "404": 1 ...} ... }
*/
export interface RequestType {
  [key: string]: { [key: string]: number };
}
export interface RequestHealth {
  inbound: RequestType;
  outbound: RequestType;
  healthAnnotations: HealthAnnotationType;
}

export interface Status {
  name: string;
  color: string;
  priority: number;
  icon: React.ComponentType<SvgIconProps>;
  class: string;
}

export interface ProxyStatus {
  CDS: string;
  EDS: string;
  LDS: string;
  RDS: string;
}

export const FAILURE: Status = {
  name: 'Failure',
  color: PFColors.Danger,
  priority: 4,
  icon: ErrorOutlineIcon,
  class: 'icon-failure',
};
export const DEGRADED: Status = {
  name: 'Degraded',
  color: PFColors.Warning,
  priority: 3,
  icon: WarningAmberIcon,
  class: 'icon-degraded',
};
export const NOT_READY: Status = {
  name: 'Not Ready',
  color: PFColors.InfoBackground,
  priority: 2,
  icon: RemoveCircleOutlineIcon,
  class: 'icon-idle',
};
export const HEALTHY: Status = {
  name: 'Healthy',
  color: PFColors.Success,
  priority: 1,
  icon: CheckCircleOutlineIcon,
  class: 'icon-healthy',
};
export const NA: Status = {
  name: 'No health information',
  color: PFColors.Color200,
  priority: 0,
  icon: HelpOutlineIcon,
  class: 'icon-na',
};

export interface ThresholdStatus {
  value: number;
  status: Status;
  violation?: string;
}

export const POD_STATUS = 'Pod Status';

// Use -1 rather than NaN to allow straigthforward comparison
export const RATIO_NA = -1;

export interface NamespaceHealthQuery {
  queryTime?: string;
  rateInterval?: string;
  type: string;
}

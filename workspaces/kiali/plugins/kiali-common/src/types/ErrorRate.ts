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
import { ThresholdStatus } from './Health';
import { ToleranceConfig } from './ServerConfig';

/*
Error Ratio for:
  - Global: Inbound and Outbound requests
  - Inbound Requests
  - Outbound Requests
 */
export interface ErrorRatio {
  global: {
    status: ThresholdStatus;
    protocol?: string;
    toleranceConfig?: ToleranceConfig;
  };
  inbound: {
    status: ThresholdStatus;
    protocol?: string;
    toleranceConfig?: ToleranceConfig;
  };
  outbound: {
    status: ThresholdStatus;
    protocol?: string;
    toleranceConfig?: ToleranceConfig;
  };
}

/*
Rate Interface:
- The number of requests in t seconds requested by the user
- The number of requests with error code
- The ratio % of errors
*/

export interface Rate {
  requestRate: number;
  errorRate: number;
  errorRatio: number;
}

/*
RequestTolerance interface
- Tolerance configuration applied
- Requests error rate calculation for the tolerance Configuration where key is the protocol
*/
export interface RequestTolerance {
  tolerance: ToleranceConfig;
  requests: { [key: string]: Rate | number };
}

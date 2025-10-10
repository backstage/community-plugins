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
  ComputedServerConfig,
  HealthAnnotationConfig,
  HealthAnnotationType,
  Rate,
  RateHealthConfig,
  RegexConfig,
  RequestHealth,
  RequestType,
  ResponseDetail,
  Responses,
} from '../../types';

export const emptyRate = (): Rate => {
  return { requestRate: 0, errorRate: 0, errorRatio: 0 };
};

export const DEFAULTCONF = {
  http: new RegExp('^[4|5]\\d\\d$'),
  grpc: new RegExp('^[1-9]$|^1[0-6]$'),
};

export const requestsErrorRateCode = (requests: RequestType): number => {
  const rate: Rate = emptyRate();
  for (const [protocol, req] of Object.entries(requests)) {
    for (const [code, value] of Object.entries(req)) {
      rate.requestRate += value;
      if (
        Object.keys(DEFAULTCONF).includes(protocol) &&
        (DEFAULTCONF as any)[protocol].test(code)
      ) {
        rate.errorRate += value;
      }
    }
  }
  return rate.requestRate === 0
    ? -1
    : (rate.errorRate / rate.requestRate) * 100;
};

export const getHealthRateAnnotation = (
  config?: HealthAnnotationType,
): string | undefined => {
  return config && HealthAnnotationConfig.HEALTH_RATE in config
    ? config[HealthAnnotationConfig.HEALTH_RATE]
    : undefined;
};

export const getErrorCodeRate = (
  requests: RequestHealth,
): { inbound: number; outbound: number } => {
  return {
    inbound: requestsErrorRateCode(requests.inbound),
    outbound: requestsErrorRateCode(requests.outbound),
  };
};

/*
Cached this method to avoid use regexp in next calculations to improve performance
 */
export const checkExpr = (
  value: RegexConfig | undefined,
  testV: string,
): boolean => {
  let reg = value;
  if (!reg) {
    return true;
  }
  if (typeof value === 'string') {
    reg = new RegExp(value);
  }
  return (reg as RegExp).test(testV);
};

// Cache the configuration to avoid multiple calls to regExp
export const configCache: { [key: string]: RateHealthConfig } = {};

export const getRateHealthConfig = (
  ns: string,
  name: string,
  kind: string,
  serverConfig: ComputedServerConfig,
): RateHealthConfig => {
  const key = `${ns}_${kind}_${name}`;
  // If we have the configuration cached then return it
  if (configCache[key]) {
    return configCache[key];
  }

  // Add defensive checks for serverConfig
  if (
    !serverConfig?.healthConfig?.rate ||
    !Array.isArray(serverConfig.healthConfig.rate)
  ) {
    return { tolerance: [] };
  }

  for (const rate of serverConfig.healthConfig.rate) {
    if (
      checkExpr(rate.namespace, ns) &&
      checkExpr(rate.name, name) &&
      checkExpr(rate.kind, kind)
    ) {
      configCache[key] = rate;
      return rate;
    }
  }

  // Return the last rate config if no specific match is found
  const lastRate =
    serverConfig.healthConfig.rate[serverConfig.healthConfig.rate.length - 1];
  if (lastRate) {
    configCache[key] = lastRate;
    return lastRate;
  }

  return { tolerance: [] };
};

/*
For Responses object like { "200": { flags: { "-": 1.2, "XXX": 3.1}, hosts: ...} } Transform to RequestType

Return object like:  {"http": { "200": 4.3}}
*/
export const transformEdgeResponses = (
  requests: Responses,
  protocol: string,
): RequestType => {
  const prot: { [key: string]: number } = {};
  const result: RequestType = {};
  result[protocol] = prot;
  for (const [code, responseDetail] of Object.entries(requests)) {
    const percentRate = Object.values(
      (responseDetail as ResponseDetail).flags,
    ).reduce((acc, value) => String(Number(acc) + Number(value)));
    result[protocol][code] = Number(percentRate);
  }

  return result;
};

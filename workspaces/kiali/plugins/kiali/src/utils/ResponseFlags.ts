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

// https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage
export const responseFlags = {
  DC: {
    code: '500',
    help: 'Downstream connection termination',
    short: 'Downstream cx term',
  },
  DI: { help: 'Delayed via fault injection' },
  DPE: {
    help: ' Downstream request had an HTTP protocol error (is port type correct?)',
    short: 'Downstream invalid HTTP',
  },
  FI: { help: 'Aborted via fault injection' },
  IH: {
    code: '400',
    help: 'Invalid value for a strictly-checked header',
    short: 'Invalid header value',
  },
  LH: {
    code: '503',
    help: 'Local service failed health check request',
    short: 'Failed health check',
  },
  LR: { code: '503', help: 'Connection local reset' },
  NR: {
    code: '404',
    help: 'No route configured (check DestinationRule or VirtualService)',
    short: 'No route',
  },
  RL: {
    code: '429',
    help: 'Ratelimited locally by the HTTP rate limit filter',
    short: 'Rate limit',
  },
  RLSE: { help: 'Rate limited service error' },
  SI: { code: '408', help: 'Stream idle timeout' },
  UAEX: { help: 'Unauthorized external service' },
  UC: {
    code: '503',
    help: 'Upstream connection termination',
    short: 'Upstream cx term',
  },
  UF: {
    code: '503',
    help: 'Upstream connection failure (check for mutual TLS configuration conflict)',
    short: 'Upstream cx failure',
  },
  UH: {
    code: '503',
    help: 'No healthy upstream hosts in upstream cluster',
    short: 'No healthy upstream',
  },
  UMSDR: { help: 'Upstream request reached max stream duration' },
  UO: {
    code: '503',
    help: 'Upstream overflow (circuit breaker open)',
    short: 'Circuit breaker open',
  },
  UR: { code: '503', help: 'Upstream remote reset' },
  URX: {
    code: '503',
    help: 'Upstream retry limit (HTTP) or Max connect attempts (TCP) exceeded',
    short: 'Upstream retry/connect limit',
  },
  UT: { code: '504', help: 'Upstream request timeout' },
};

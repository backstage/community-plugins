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
import type {
  ProtocolTraffic,
  ProtocolWithTraffic,
  ValidProtocols,
} from '../types';
import { TrafficRate } from '../types';

export const hasProtocolTraffic = (
  protocolTraffic: ProtocolTraffic,
): protocolTraffic is ProtocolWithTraffic => {
  return (
    (protocolTraffic as ProtocolWithTraffic).rates !== undefined &&
    (protocolTraffic as ProtocolWithTraffic).responses !== undefined
  );
};

export const prettyProtocol = (protocol: ValidProtocols): string => {
  switch (protocol.toLocaleLowerCase('en-US')) {
    case 'http':
      return 'HTTP';
    case 'tcp':
      return 'TCP';
    default:
      return 'gRPC';
  }
};

export const toTcpRate = (rate: string): TrafficRate | undefined => {
  switch (rate) {
    case 'received':
      return TrafficRate.TCP_RECEIVED;
    case 'sent':
      return TrafficRate.TCP_SENT;
    case 'total':
      return TrafficRate.TCP_TOTAL;
    default:
      return undefined;
  }
};

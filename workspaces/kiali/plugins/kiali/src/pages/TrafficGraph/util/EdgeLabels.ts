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
  aggregate,
  ascendingThresholdCheck,
  checkExpr,
  getRateHealthConfig,
  RateHealth,
  transformEdgeResponses,
} from '@backstage-community/plugin-kiali-common/func';
import {
  DecoratedGraphEdgeData,
  DecoratedGraphNodeData,
  DEGRADED,
  EdgeLabelMode,
  FAILURE,
  HEALTHY,
  NA,
  numLabels,
  Protocol,
  Rate,
  RATIO_NA,
  RequestTolerance,
  Responses,
  ThresholdStatus,
  ToleranceConfig,
  TrafficRate,
} from '@backstage-community/plugin-kiali-common/types';
import {
  EdgeModel,
  EdgeTerminalType,
  NodeStatus,
} from '@patternfly/react-topology';
import _ from 'lodash';
import { PFColors } from '../../../components/Pf/PfColors';
import { serverConfig } from '../../../config';
import { icons } from '../../../config/Icons';
import { EdgeData } from '../types/EdgeData';
import { GraphPFSettings } from '../types/GraphPFSettings';
import { NodeData } from '../types/NodeData';
import { NodeMap } from '../types/NodeMap';

export const trimFixed = (fixed: string): string => {
  if (!fixed.includes('.')) {
    return fixed;
  }
  let newFixed = fixed;
  while (newFixed.endsWith('0')) {
    newFixed = newFixed.slice(0, -1);
  }
  return newFixed.endsWith('.') ? newFixed.slice(0, -1) : newFixed;
};

// This is due to us never having figured out why a tiny fraction of what-we-expect-to-be-numbers
// are in fact strings.  We don't know if our conversion in GraphData.ts has a flaw, or whether
// something else happens post-conversion.
export const safeNum = (num: any): number => {
  if (Number.isFinite(num)) {
    return num;
  }
  // this will return NaN if the string is 'NaN' or any other non-number
  return Number(num);
};

export const toFixedDuration = (num: number): string => {
  const newNum = safeNum(num);
  if (num < 1000) {
    return `${newNum.toFixed(0)}ms`;
  }
  return `${trimFixed((newNum / 1000.0).toFixed(2))}s`;
};

export const toFixedPercent = (num: number): string => {
  const newNum = safeNum(num);
  return `${trimFixed(newNum.toFixed(1))}%`;
};

export const toFixedRequestRate = (
  num: number,
  includeUnits: boolean,
  units?: string,
): string => {
  const newNum = safeNum(num);
  const rate = trimFixed(newNum.toFixed(2));
  return includeUnits ? `${rate}${units || 'rps'}` : rate;
};

export const toFixedErrRate = (num: number): string => {
  const newNum = safeNum(num);
  return `${trimFixed(newNum.toFixed(newNum < 1 ? 1 : 0))}%err`;
};

export const toFixedByteRate = (num: number, includeUnits: boolean): string => {
  const newNum = safeNum(num);
  if (newNum < 1024.0) {
    const rate =
      newNum < 1.0 ? trimFixed(newNum.toFixed(2)) : newNum.toFixed(0);
    return includeUnits ? `${rate}bps` : rate;
  }
  const rate = trimFixed((num / 1024.0).toFixed(2));
  return includeUnits ? `${rate}kps` : rate;
};

const getEdgeLabel = (
  edge: EdgeModel,
  nodeMap: NodeMap,
  settings: GraphPFSettings,
): string => {
  const data = edge.data as EdgeData;
  const edgeLabels = settings.edgeLabels;
  const isVerbose = data.isSelected;
  const includeUnits = isVerbose || numLabels(edgeLabels) > 1;
  const labels = [] as string[];

  if (edgeLabels.includes(EdgeLabelMode.TRAFFIC_RATE)) {
    let rate = 0;
    let pErr = 0;
    if (data.http > 0) {
      rate = data.http;
      pErr = data.httpPercentErr > 0 ? data.httpPercentErr : 0;
    } else if (data.grpc > 0) {
      rate = data.grpc;
      pErr = data.grpcPercentErr > 0 ? data.grpcPercentErr : 0;
    } else if (data.tcp > 0) {
      rate = data.tcp;
    }

    if (rate > 0) {
      if (pErr > 0) {
        labels.push(
          `${toFixedRequestRate(rate, includeUnits)}\n${toFixedErrRate(pErr)}`,
        );
      } else {
        switch (data.protocol) {
          case Protocol.GRPC:
            if (settings.trafficRates.includes(TrafficRate.GRPC_REQUEST)) {
              labels.push(toFixedRequestRate(rate, includeUnits));
            } else {
              labels.push(toFixedRequestRate(rate, includeUnits, 'mps'));
            }
            break;
          case Protocol.TCP:
            labels.push(toFixedByteRate(rate, includeUnits));
            break;
          default:
            labels.push(toFixedRequestRate(rate, includeUnits));
            break;
        }
      }
    }
  }

  if (edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_GROUP)) {
    const responseTime = data.responseTime;

    if (responseTime > 0) {
      labels.push(toFixedDuration(responseTime));
    }
  }

  if (edgeLabels.includes(EdgeLabelMode.THROUGHPUT_GROUP)) {
    const rate = data.throughput;

    if (rate > 0) {
      labels.push(toFixedByteRate(rate, includeUnits));
    }
  }

  if (edgeLabels.includes(EdgeLabelMode.TRAFFIC_DISTRIBUTION)) {
    let pReq;
    if (data.httpPercentReq > 0) {
      pReq = data.httpPercentReq;
    } else if (data.grpcPercentReq > 0) {
      pReq = data.grpcPercentReq;
    }
    if (pReq && pReq > 0 && pReq < 100) {
      labels.push(toFixedPercent(pReq));
    }
  }

  let label = labels.join('\n');

  if (isVerbose) {
    const protocol = data.protocol;
    label = protocol ? `${protocol}\n${label}` : label;
  }

  const mtlsPercentage = data.isMTLS;
  let lockIcon = false;
  if (settings.showSecurity && data.hasTraffic) {
    if (mtlsPercentage && mtlsPercentage > 0) {
      lockIcon = true;
      label = `${icons.istio.mtls.ascii}\n${label}`;
    }
  }

  if (data.hasTraffic && data.responses) {
    if (nodeMap.get(edge.target!)?.data?.hasCB) {
      const responses = data.responses;
      for (const code of _.keys(responses)) {
        // TODO: Not 100% sure we want "UH" code here ("no healthy upstream hosts") but based on timing I have
        // seen this code returned and not "UO". "UO" is returned only when the circuit breaker is caught open.
        // But if open CB is responsible for removing possible destinations the "UH" code seems preferred.
        if ('UO' in responses[code] || 'UH' in responses[code]) {
          label = lockIcon
            ? `${icons.istio.circuitBreaker.className} ${label}`
            : `${icons.istio.circuitBreaker.className}\n${label}`;
          break;
        }
      }
    }
  }

  return label;
};

const EdgeColor = PFColors.Success;
const EdgeColorDead = PFColors.Black500;
const EdgeColorDegraded = PFColors.Warning;
const EdgeColorFailure = PFColors.Danger;
const EdgeColorTCPWithTraffic = PFColors.Blue600;

const getPathStyleStroke = (data: EdgeData): PFColors => {
  if (!data.hasTraffic) {
    return EdgeColorDead;
  }
  if (data.protocol === 'tcp') {
    return EdgeColorTCPWithTraffic;
  }
  switch (data.healthStatus) {
    case FAILURE.name:
      return EdgeColorFailure;
    case DEGRADED.name:
      return EdgeColorDegraded;
    default:
      return EdgeColor;
  }
};

export const getPathStyle = (data: EdgeData): React.CSSProperties => {
  return {
    stroke: getPathStyleStroke(data),
    strokeWidth: 3,
  } as React.CSSProperties;
};

export const getEdgeStatus = (data: EdgeData): NodeStatus => {
  if (!data.hasTraffic) {
    return NodeStatus.default;
  }
  if (data.protocol === 'tcp') {
    return NodeStatus.info;
  }

  switch (data.healthStatus) {
    case FAILURE.name:
      return NodeStatus.danger;
    case DEGRADED.name:
      return NodeStatus.warning;
    default:
      return NodeStatus.success;
  }
};

export const setEdgeOptions = (
  edge: EdgeModel,
  nodeMap: NodeMap,
  settings: GraphPFSettings,
): void => {
  const data = edge.data as EdgeData;

  data.endTerminalType =
    data.protocol === Protocol.TCP
      ? EdgeTerminalType.square
      : EdgeTerminalType.directional;
  data.pathStyle = getPathStyle(data);
  data.tag = getEdgeLabel(edge, nodeMap, settings);
  data.tagStatus = getEdgeStatus(data);
};

export interface DecoratedGraphEdgeWrapper {
  data: DecoratedGraphEdgeData;
}

export const calculateStatusGraph = (
  requestsTolerances: RequestTolerance[],
  traffic: Responses,
): {
  status: ThresholdStatus;
  protocol: string;
  toleranceConfig?: ToleranceConfig;
} => {
  // By default the health is NA
  const result: {
    status: ThresholdStatus;
    protocol: string;
    toleranceConfig?: ToleranceConfig;
  } = {
    status: {
      value: RATIO_NA,
      status: NA,
    },
    protocol: '',
    toleranceConfig: undefined,
  };
  // For each calculate errorRate by tolerance configuration
  for (const reqTol of Object.values(requestsTolerances)) {
    for (const [protocol, rate] of Object.entries(reqTol.requests)) {
      const tolerance =
        reqTol.tolerance && checkExpr(reqTol!.tolerance!.protocol, protocol)
          ? reqTol.tolerance
          : undefined;
      // Create threshold for the tolerance
      const thresholds = {
        degraded: tolerance!.degraded,
        failure: tolerance!.failure,
        unit: '%',
      };
      // Calculate the status
      const errRatio = (rate as Rate).errorRatio;
      const auxStatus = ascendingThresholdCheck(100 * errRatio, thresholds);
      // Check if the status has more priority than the previous one
      if (auxStatus.status.priority > result.status.status.priority) {
        result.status = auxStatus;
        result.protocol = protocol;
        result.toleranceConfig = reqTol.tolerance;
      }
    }
  }
  if (result.status.status === NA && Object.keys(traffic).length > 0) {
    result.status.status = HEALTHY;
    result.status.value = 0;
  }
  return result;
};

export const getEdgeHealth = (
  edge: DecoratedGraphEdgeData,
  source: DecoratedGraphNodeData,
  target: DecoratedGraphNodeData,
): ThresholdStatus => {
  const annotationSource = source.hasHealthConfig
    ? new RateHealth(source.hasHealthConfig)
    : undefined;
  const configSource =
    annotationSource && annotationSource.toleranceConfig
      ? annotationSource.toleranceConfig
      : getRateHealthConfig(
          source.namespace,
          source.nodeType,
          source.nodeType,
          serverConfig,
        ).tolerance;
  const annotationTarget = target.hasHealthConfig
    ? new RateHealth(target.hasHealthConfig)
    : undefined;
  const configTarget =
    annotationTarget && annotationTarget.toleranceConfig
      ? annotationTarget.toleranceConfig
      : getRateHealthConfig(
          target.namespace,
          target.nodeType,
          target.nodeType,
          serverConfig,
        ).tolerance;

  // If there is not tolerances with this configuration we'll use defaults
  const tolerancesSource = configSource.filter(tol =>
    checkExpr(tol.direction, 'outbound'),
  );
  const tolerancesTarget = configTarget.filter(tol =>
    checkExpr(tol.direction, 'inbound'),
  );

  // Calculate aggregate
  const outboundEdge = aggregate(
    transformEdgeResponses(edge.responses, edge.protocol),
    tolerancesSource,
  );
  const inboundEdge = aggregate(
    transformEdgeResponses(edge.responses, edge.protocol),
    tolerancesTarget,
  );

  // Calculate status
  const outboundEdgeStatus = calculateStatusGraph(outboundEdge, edge.responses);
  const inboundEdgeStatus = calculateStatusGraph(inboundEdge, edge.responses);
  // Keep status with more priority
  return outboundEdgeStatus.status.status.priority >
    inboundEdgeStatus.status.status.priority
    ? outboundEdgeStatus.status
    : inboundEdgeStatus.status;
};

export const assignEdgeHealth = (
  edges: DecoratedGraphEdgeWrapper[],
  nodeMap: NodeMap,
  settings: GraphPFSettings,
): void => {
  edges?.forEach(edge => {
    const edgeData = edge.data as EdgeData;

    if (!edgeData.hasTraffic) {
      return;
    }
    if (edgeData.protocol === 'tcp') {
      return;
    }
    if (
      edgeData.protocol === 'grpc' &&
      !settings.trafficRates.includes(TrafficRate.GRPC_REQUEST)
    ) {
      return;
    }

    const sourceNodeData = nodeMap.get(edgeData.source!)?.data as NodeData;
    const destNodeData = nodeMap.get(edgeData.target!)?.data as NodeData;
    const statusEdge = getEdgeHealth(edgeData, sourceNodeData, destNodeData);
    switch (statusEdge.status) {
      case FAILURE:
        edgeData.healthStatus = FAILURE.name;
        return;
      case DEGRADED:
        edgeData.healthStatus = DEGRADED.name;
        return;
      default:
        // unset implies healthy or n/a
        return;
    }
  });
};

export const getTotalRequest = (traffic: Responses): number => {
  let reqRate = 0;
  Object.values(traffic).forEach(item => {
    Object.values(item.flags).forEach(v => (reqRate += Number(v)));
  });
  return reqRate;
};

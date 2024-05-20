export interface Metric {
  name: string;
  namespace: string;
  type: MetricType;
  totalRequests: number;
  requestRate: number;
  successRate: number;
  pods: {
    totalPods: number;
    meshedPods: number;
    meshedPodsPercentage: number;
  };
  tcpStats?: {
    openConnections: number;
    readBytes: number;
    writeBytes: number;
    readRate: number;
    writeRate: number;
  };
  latency?: {
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface Edge {
  src: {
    namespace: string;
    name: string;
    type: MetricType;
  };
  dst: {
    namespace: string;
    name: string;
    type: MetricType;
  };
  clientId: string;
  serverId: string;
  noIdentityMsg: string;
}

type MetricType = Partial<'deployment' | 'service' | 'authority' | 'pod'>;

export interface DeploymentResponse {
  incoming: Metric[];
  outgoing: Metric[];
  current: Metric;
  edges: Edge[];
}

export interface L5dClient {
  getForDeployment(
    namespace: string,
    deployment: string,
  ): Promise<DeploymentResponse>;
}

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

type MetricType = Partial<'deployment' | 'service' | 'authority' | 'pod'>;

export interface DeploymentResponse {
  incoming: Metric[];
  outgoing: Metric[];
  current: Metric;
}

export interface L5dClient {
  getForDeployment(
    namespace: string,
    deployment: string,
  ): Promise<DeploymentResponse>;
}

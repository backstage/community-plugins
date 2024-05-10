interface Resource {
  namespace: string;
  type: string;
  name: string;
}
interface Stats {
  successCount: string;
  failureCount: string;
  latencyMsP50: string;
  latencyMsP95: string;
  latencyMsP99: string;
  actualSuccessCount: string;
  actualFailureCount: string;
}

interface BackstageMetrics {
  totalRequests: number;
  rps: number;
  successRate: number;
  failureRate: number;
}

export interface Metrics {
  resource: Resource;
  timeWindow: string;
  status: string;
  meshedPodCount: string;
  runningPodCount: string;
  failedPodCount: string;
  stats: Stats;
  b7e: BackstageMetrics;
}

type MetricType = Partial<'deployment' | 'service' | 'authority' | 'pod'>;

export interface DeploymentResponse {
  incoming: Record<MetricType, Metrics>;
  outgoing: Record<MetricType, Metrics>;
}

export interface L5dClient {
  getForDeployment(
    namespace: string,
    deployment: string,
  ): Promise<DeploymentResponse>;
}

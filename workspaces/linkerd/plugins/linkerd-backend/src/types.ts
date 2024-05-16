export interface StatRow {
  resource: {
    type: string;
    name: string;
    namespace: string;
  };
  timeWindow: string;
  status: string;
  meshedPodCount: string;
  runningPodCount: string;
  failedPodCount: string;
  stats: {
    successCount: string;
    failureCount: string;
    latencyMsP50: string;
    latencyMsP95: string;
    latencyMsP99: string;
    actualSuccessCount: string;
    actualFailureCount: string;
  };
  tcpStats?: {
    openConnections: string;
    readBytesTotal: string;
    writeBytesTotal: string;
  };
}

export interface StatsResponse {
  ok: {
    statTables: {
      podGroup: {
        rows: StatRow[];
      };
    }[];
  };
}

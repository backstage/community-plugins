import { AnalysisRun } from './analysisRuns';
import { ReplicaSet } from './resources';
import { Rollout } from './rollouts';

export interface Revision extends ReplicaSet {
  rollout: Rollout;
  analysisRuns: AnalysisRun[];
}

export interface RolloutUI extends Rollout {
  revisions: Revision[];
}

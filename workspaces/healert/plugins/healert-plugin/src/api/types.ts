/**
 * Core data types for the Healert plugin v1.
 *
 * v1 focuses on a single concept: the Friction Score.
 * A composite 0-100 score per service derived from:
 *   - Kubernetes Audit Log bypass events
 *   - GitHub pipeline skips / manual merges
 *   - Jira tickets filed against the platform team
 */

/** Severity level derived from the friction score */
export type FrictionSeverity = 'low' | 'medium' | 'high' | 'critical';

/** A single golden path bypass event */
export interface BypassEvent {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Team or user who triggered the bypass */
  actor: string;
  /** Type of bypass: kubectl-exec, pipeline-skip, manual-merge, platform-ticket */
  type: 'kubectl-exec' | 'pipeline-skip' | 'manual-merge' | 'platform-ticket';
  /** Human-readable description of what was bypassed */
  description: string;
  /** Workflow that was bypassed: deploy, provision, rollback, onboard, release */
  workflow:
    | 'deploy'
    | 'provision'
    | 'rollback'
    | 'onboard'
    | 'release'
    | 'other';
}

/** The Friction Score for a single service */
export interface FrictionScore {
  /** 0-100. Higher = more friction. */
  score: number;
  /** Derived severity bucket */
  severity: FrictionSeverity;
  /** Total bypass events in the current window (default: 7 days) */
  bypassCount: number;
  /** Estimated weekly overhead per engineer in hours */
  overheadHoursPerEngineer: number;
  /** The workflow with the most bypass events */
  topFrictionWorkflow: string;
  /** ISO 8601 timestamp of when this score was last calculated */
  calculatedAt: string;
}

/** Full friction data payload for a service */
export interface FrictionData {
  /** Backstage entity ref: kind:namespace/name */
  entityRef: string;
  /** The friction score */
  frictionScore: FrictionScore;
  /** Recent bypass events (capped at 10 for v1) */
  recentEvents: BypassEvent[];
  /** Data sources successfully queried */
  sources: {
    kubernetesAuditLog: boolean;
    github: boolean;
    jira: boolean;
  };
  /** ISO 8601 timestamp */
  fetchedAt: string;
}

/** API response wrapper */
export interface HealertApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

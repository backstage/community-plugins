/*
 * Copyright 2026 The Backstage Authors
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



/**
 *
 * Shows friction data scoped to the entity page currently open.
 * Each cell = one workflow × one event type intersection.
 * Clicking a cell opens a drill-down panel with actors and recent events.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GRID STRUCTURE
 * ─────────────────────────────────────────────────────────────────────────────
 *  Rows    = workflows detected in this entity's events (deploy, rollback, etc.)
 *  Columns = event types detected in this entity's events (kubectl-exec, etc.)
 *  Cells   = number of bypass events at that workflow × type intersection
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DATA SOURCE
 * ─────────────────────────────────────────────────────────────────────────────
 *  GET /friction/{entityRef}  — same endpoint as FrictionScoreCard
 *  Entity ref read dynamically from useEntity() context.
 *  Only events for the current entity are shown — never cross-service data.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTERACTIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *  Click cell     → opens drill-down panel: score, top actors, recent events
 *  Hover cell     → tooltip: score, event count, top actor
 *  Click ×        → closes drill-down panel
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { InfoCard, Progress } from '@backstage/core-components';
import { healertApiRef } from '../../api';
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

// =============================================================================
// TYPES
// =============================================================================

/** A single cell in the heatmap — one workflow × one event type */
export interface FrictionCell {
  frictionScore: number;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  topSource: string;
  deviationCount: number;
  team: string; // row label (workflow name)
  workflow: string; // col label (event type)
  topActors: string[];
  recentEvents: CellEvent[];
}

/** A single bypass event shown in the drill-down panel */
export interface CellEvent {
  type: string;
  actor: string;
  description: string;
  timestamp: string;
}

/** Full heatmap data — rows = workflows, columns = event types */
export interface FrictionMatrix {
  teams: string[]; // row labels  (workflows)
  workflows: string[]; // col labels  (event types)
  cells: FrictionCell[][];
  updatedAt: string;
}

// =============================================================================
// DATA HOOK
//
// Reads the current entity from Backstage EntityProvider context.
// Fetches GET /friction/{entityRef} — same endpoint as FrictionScoreCard.
// Builds a workflow × event type grid from the returned events.
// =============================================================================

function useFrictionMatrix() {
  const healertApi = useApi(healertApiRef);
  const { entity } = useEntity();

  const [data, setData] = useState<FrictionMatrix | null>(null);
  const [loading, setLoading] = useState(true);

  // Build entity ref from the current Backstage entity page context
  const entityRef = [
    entity.kind.toLowerCase(),
    ':',
    entity.metadata.namespace || 'default',
    '/',
    entity.metadata.name,
  ].join('');

  const buildMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const json = await healertApi.getFrictionData(entityRef);

      // Events come from the frictionScore response
      const events: any[] = json.recentEvents || [];

      if (events.length === 0) {
        setData({
          teams: [],
          workflows: [],
          cells: [],
          updatedAt: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      // Collect unique workflows (rows) and event types (columns)
      const workflowsSet = new Set<string>();
      const typesSet = new Set<string>();

      events.forEach(e => {
        workflowsSet.add(e.workflow || 'deploy');
        typesSet.add(e.type || 'unknown');
      });

      const workflows = [...workflowsSet].sort(); // rows
      const types = [...typesSet].sort(); // columns

      // Aggregate events per workflow × type cell
      const aggMap: Record<string, any[]> = {};
      events.forEach(e => {
        const key = `${e.workflow || 'deploy'}||${e.type || 'unknown'}`;
        if (!aggMap[key]) aggMap[key] = [];
        aggMap[key].push(e);
      });

      // Build cells grid: cells[workflowIndex][typeIndex]
      const cells: FrictionCell[][] = workflows.map(workflow =>
        types.map(type => {
          const evts = aggMap[`${workflow}||${type}`] || [];
          const count = evts.length;
          const score = Math.min(100, count * 15);

          const sev: FrictionCell['severity'] =
            count === 0
              ? 'none'
              : score < 20
              ? 'low'
              : score < 50
              ? 'medium'
              : score < 80
              ? 'high'
              : 'critical';

          // Unique actors for this cell
          const actors = [
            ...new Set(evts.map((e: any) => e.actor).filter(Boolean)),
          ].slice(0, 3) as string[];

          // Most recent 3 events for drill-down
          const recent: CellEvent[] = evts
            .sort(
              (a: any, b: any) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            )
            .slice(0, 3)
            .map((e: any) => ({
              type: e.type || 'unknown',
              actor: e.actor || 'unknown',
              description: e.description || e.type,
              timestamp: e.timestamp || new Date().toISOString(),
            }));

          return {
            frictionScore: score,
            severity: sev,
            topSource: type,
            deviationCount: count,
            team: workflow, // stored in "team" field for compatibility
            workflow: type, // stored in "workflow" field for compatibility
            topActors: actors,
            recentEvents: recent,
          };
        }),
      );

      setData({
        teams: workflows, // rows  = workflows
        workflows: types, // cols  = event types
        cells,
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
    } catch {
      // Backend unreachable — show empty state
      setData({
        teams: [],
        workflows: [],
        cells: [],
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
    }
  }, [entityRef]);

  useEffect(() => {
    buildMatrix();
  }, [buildMatrix]);

  return { data, loading, entityRef };
}

// =============================================================================
// SEVERITY PALETTE
// =============================================================================

const SEVERITY_PALETTE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  none: { bg: '#F1F5F9', text: '#94A3B8', border: '#E2E8F0' },
  low: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
  medium: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  high: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
  critical: { bg: '#FDF2F8', text: '#86198F', border: '#F0ABFC' },
};

/** Maps event type keys to human-readable labels */
const TYPE_LABELS: Record<string, string> = {
  'kubectl-exec': 'kubectl exec',
  'pipeline-skip': 'Pipeline Skip',
  'manual-merge': 'Manual Merge',
  'platform-ticket': 'Platform Ticket',
  'emergency-access': 'Emergency Access',
  'config-drift': 'Config Drift',
  'port-forward': 'Port Forward',
  'secret-deletion': 'Secret Deletion',
  'configmap-drift': 'ConfigMap Drift',
  'namespace-creation': 'Namespace Create',
  'rbac-change': 'RBAC Change',
  'node-access': 'Node Access',
  'pv-deletion': 'PV Deletion',
  'ingress-drift': 'Ingress Drift',
};

/**
 * Returns a display-friendly label for any event type.
 * For unknown types: converts kebab-case to Title Case.
 * Example: "my-custom-rule" -> "My Custom Rule"
 */

function getTypeLabel(type: string): string {
  if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  // Dynamic fallback: convert kebab-case to Title Case
  // "my-custom-rule" -> "My Custom Rule"
  return type
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function relativeTime(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles(theme => ({
  heatmapWrapper: { overflowX: 'auto', width: '100%' },
  heatmapGrid: {
    display: 'inline-grid',
    gap: 6,
    minWidth: 300,
    alignItems: 'end',
  },

  // Column headers (event type names)
  headerCell: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    // Dynamic height — enough room for 2-line labels at 0.60rem
    // Extra paddingBottom creates breathing room between header and first row
    padding: '4px 6px 10px 6px',
    minHeight: 48,
    width: '100%',
    boxSizing: 'border-box' as const,
    fontFamily: 'monospace',
    fontSize: '0.60rem',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    textAlign: 'center' as const,
    lineHeight: 1.3,
    // Allow wrapping on hyphens and spaces — critical for long event type names
    whiteSpace: 'normal' as const,
    wordBreak: 'break-word' as const,
    overflowWrap: 'anywhere' as const,
    hyphens: 'auto' as const,
  },

  // Row labels (workflow names)
  rowLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12,
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#0F172A',
    whiteSpace: 'nowrap',
  },

  // Data cells — bg and text set inline from severity
  cell: {
    width: '100%',
    height: 56,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: '2px solid transparent',
    '&:hover': {
      transform: 'scale(1.08)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 2,
      position: 'relative',
    },
  },
  cellScore: {
    fontFamily: 'monospace',
    fontSize: '1.2rem',
    fontWeight: 800,
    lineHeight: 1,
  },
  cellCount: {
    fontFamily: 'monospace',
    fontSize: '0.52rem',
    opacity: 0.7,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  // Legend
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    display: 'inline-block',
    marginRight: 5,
    verticalAlign: 'middle',
  },
  legendLabel: {
    fontSize: '0.68rem',
    fontFamily: 'monospace',
    color: '#64748B',
    verticalAlign: 'middle',
  },

  // Drill-down panel
  drillPanel: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(2),
    position: 'relative',
  },
  drillHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  eventRow: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    fontFamily: 'monospace',
    fontSize: '0.62rem',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 4,
    background: '#FEE2E2',
    color: '#DC2626',
  },
  sectionLabel: {
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#64748B',
    fontFamily: 'monospace',
    fontSize: '0.62rem',
    marginBottom: 8,
  },
}));

// =============================================================================
// DRILL-DOWN PANEL
// =============================================================================

function DrillDownPanel({
  cell,
  onClose,
}: {
  cell: FrictionCell;
  onClose: () => void;
}) {
  const classes = useStyles();
  const pal = SEVERITY_PALETTE[cell.severity];

  return (
    <div className={classes.drillPanel}>
      {/* Header */}
      <div className={classes.drillHeader}>
        <div>
          <Box
            display="flex"
            alignItems="center"
            style={{ gap: 10, marginBottom: 4 }}
          >
            <span
              style={{
                background: pal.bg,
                color: pal.text,
                border: `1.5px solid ${pal.border}`,
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 5,
              }}
            >
              {cell.severity.toUpperCase()}
            </span>
            <Typography
              style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}
            >
              {cell.team} &times; {getTypeLabel(cell.workflow)}
            </Typography>
          </Box>
          <Typography
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              fontFamily: 'monospace',
            }}
          >
            {cell.deviationCount} bypass event
            {cell.deviationCount !== 1 ? 's' : ''} &nbsp;·&nbsp; Friction score:{' '}
            {cell.frictionScore}
          </Typography>
        </div>
        <IconButton size="small" onClick={onClose} style={{ color: '#94A3B8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <Divider style={{ marginBottom: 16 }} />

      <Grid container spacing={3}>
        {/* Score bar */}
        <Grid item xs={12} sm={4}>
          <Typography className={classes.sectionLabel}>
            Friction Score
          </Typography>
          <Typography
            style={{
              fontFamily: 'monospace',
              fontSize: '2.6rem',
              fontWeight: 800,
              color: pal.text,
              lineHeight: 1,
            }}
          >
            {cell.frictionScore}
          </Typography>
          <Typography
            style={{
              fontSize: '0.62rem',
              color: '#94A3B8',
              fontFamily: 'monospace',
              marginTop: 4,
            }}
          >
            / 100
          </Typography>
          <div
            style={{
              marginTop: 8,
              width: '100%',
              height: 6,
              background: '#E2E8F0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${cell.frictionScore}%`,
                height: '100%',
                background: pal.text,
                borderRadius: 3,
              }}
            />
          </div>
        </Grid>

        {/* Top actors */}
        <Grid item xs={12} sm={4}>
          <Typography className={classes.sectionLabel}>Top Actors</Typography>
          {cell.topActors.length === 0 ? (
            <Typography
              style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                fontFamily: 'monospace',
              }}
            >
              No actors recorded
            </Typography>
          ) : (
            cell.topActors.map((actor, i) => (
              <Box
                key={actor}
                display="flex"
                alignItems="center"
                style={{ gap: 8, marginBottom: 6 }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.62rem',
                    color: '#94A3B8',
                    minWidth: 20,
                  }}
                >
                  #{i + 1}
                </span>
                <Typography
                  style={{
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    color: '#0F172A',
                  }}
                >
                  {actor.split('@')[0]}
                </Typography>
              </Box>
            ))
          )}
        </Grid>

        {/* Event type chip */}
        <Grid item xs={12} sm={4}>
          <Typography className={classes.sectionLabel}>Event Type</Typography>
          <Chip
            size="small"
            label={getTypeLabel(cell.workflow)}
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          />
          <Typography
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: 8,
              lineHeight: 1.6,
            }}
          >
            {cell.deviationCount} event{cell.deviationCount !== 1 ? 's' : ''} in
            the <strong>{cell.team}</strong> workflow
          </Typography>
        </Grid>
      </Grid>

      {/* Recent events list */}
      {cell.recentEvents.length > 0 && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <Typography className={classes.sectionLabel}>
            Recent Events
          </Typography>
          {cell.recentEvents.map((evt, i) => (
            <div key={i} className={classes.eventRow}>
              <Box display="flex" alignItems="center" style={{ gap: 10 }}>
                <span className={classes.typeBadge}>
                  {getTypeLabel(evt.type)}
                </span>
                <div>
                  <Typography
                    style={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: '#0F172A',
                    }}
                  >
                    {evt.actor.split('@')[0]}
                  </Typography>
                  <Typography style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    {evt.description}
                  </Typography>
                </div>
              </Box>
              <Typography
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: '#94A3B8',
                  whiteSpace: 'nowrap',
                  marginLeft: 8,
                }}
              >
                {relativeTime(evt.timestamp)}
              </Typography>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT — FrictionHeatmap
//
// Renders a workflow × event type heatmap for the current entity.
// Each colored cell shows the friction at that intersection.
// Clicking opens the DrillDownPanel.
// =============================================================================

/** @public */
export function FrictionHeatmap() {
  const classes = useStyles();
  const { data, loading, entityRef } = useFrictionMatrix();
  const [selectedCell, setSelectedCell] = useState<FrictionCell | null>(null);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <InfoCard title="Friction Heatmap">
        <Progress />
      </InfoCard>
    );
  }

  // ── Empty state — no events for this entity ────────────────────────────────
  if (!data || data.teams.length === 0) {
    return (
      <InfoCard title="Friction Heatmap">
        <Typography
          style={{
            fontSize: '0.82rem',
            color: '#94A3B8',
            padding: 24,
            fontFamily: 'monospace',
            textAlign: 'center',
          }}
        >
          No friction events yet for <strong>{entityRef}</strong>. Send events
          to the backend to populate the heatmap.
        </Typography>
      </InfoCard>
    );
  }

  const { teams: workflows, workflows: types, cells, updatedAt } = data;

  // ── Summary stats ──────────────────────────────────────────────────────────
  const allCells = cells.flat();
  const criticalN = allCells.filter(c => c.severity === 'critical').length;
  const highN = allCells.filter(c => c.severity === 'high').length;
  const totalScore = allCells.reduce((s, c) => s + c.frictionScore, 0);
  const avgScore = Math.round(totalScore / Math.max(allCells.length, 1));

  // ── Grid template: dynamic column width based on longest label ──────────────
  // Each character ≈ 7px at 0.60rem monospace. Min 80px, max 160px.
  // This means columns auto-size — a short label like "kubectl exec" gets a
  // narrow column while "emergency-access" gets a wider one.
  const colWidth = (type: string): number => {
    const label = getTypeLabel(type);
    // Split into words and find the longest word length
    const longestWord = label
      .split(/[-\s]/)
      .reduce((max, w) => Math.max(max, w.length), 0);
    // Also consider full label length for short labels that fit on one line
    const fullLen = label.replace(/-/g, ' ').length;
    // Use whichever needs more space
    const chars = fullLen <= 8 ? fullLen : longestWord;
    // ~7.5px per char at 0.60rem monospace, plus 16px padding
    return Math.min(160, Math.max(80, Math.ceil(chars * 7.5) + 16));
  };
  const gridTemplate = `auto ${types.map(t => `${colWidth(t)}px`).join(' ')}`;

  const cardAction = (
    <Typography
      style={{ fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace' }}
    >
      {entityRef} · Updated {relativeTime(updatedAt)}
    </Typography>
  );

  return (
    <InfoCard
      title="Friction Heatmap — Workflow × Event Type"
      action={cardAction}
    >
      <Box display="flex" flexDirection="column" style={{ gap: 20 }}>
        {/* ── Summary stats row ── */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box
              style={{
                background: '#FDF2F8',
                border: '1px solid #F0ABFC',
                borderRadius: 8,
                padding: '10px 14px',
                textAlign: 'center',
              }}
            >
              <Typography
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#86198F',
                  lineHeight: 1,
                }}
              >
                {criticalN}
              </Typography>
              <Typography
                style={{
                  fontSize: '0.62rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 3,
                }}
              >
                Critical Cells
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: 8,
                padding: '10px 14px',
                textAlign: 'center',
              }}
            >
              <Typography
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#DC2626',
                  lineHeight: 1,
                }}
              >
                {highN}
              </Typography>
              <Typography
                style={{
                  fontSize: '0.62rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 3,
                }}
              >
                High Friction
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              style={{
                background: '#F0FDFA',
                border: '1px solid #99F6E4',
                borderRadius: 8,
                padding: '10px 14px',
                textAlign: 'center',
              }}
            >
              <Typography
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#0D9488',
                  lineHeight: 1,
                }}
              >
                {avgScore}
              </Typography>
              <Typography
                style={{
                  fontSize: '0.62rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 3,
                }}
              >
                Avg Score
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '10px 14px',
                textAlign: 'center',
              }}
            >
              <Typography
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#475569',
                  lineHeight: 1,
                }}
              >
                {workflows.length}×{types.length}
              </Typography>
              <Typography
                style={{
                  fontSize: '0.62rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 3,
                }}
              >
                Workflows × Types
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* ── Heatmap grid ── */}
        <div className={classes.heatmapWrapper}>
          <div
            className={classes.heatmapGrid}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {/* Top-left corner spacer */}
            <div />

            {/* Column headers — event types */}
            {types.map(type => (
              <div key={type} className={classes.headerCell}>
                {getTypeLabel(type)}
              </div>
            ))}

            {/* Rows: workflow label + data cells */}
            {workflows.map((workflow, wi) => (
              <React.Fragment key={workflow}>
                {/* Row label — workflow name */}
                <div className={classes.rowLabel}>{workflow}</div>

                {/* Data cells */}
                {types.map((type, ti) => {
                  const cell = cells[wi][ti];
                  const pal = SEVERITY_PALETTE[cell.severity];
                  const isSelected =
                    selectedCell?.team === workflow &&
                    selectedCell?.workflow === type;

                  return (
                    <Tooltip
                      key={type}
                      title={
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {workflow} × {getTypeLabel(type)}
                          </div>
                          <div>Score: {cell.frictionScore}</div>
                          <div>
                            {cell.deviationCount} event
                            {cell.deviationCount !== 1 ? 's' : ''}
                          </div>
                          {cell.topActors[0] && (
                            <div>
                              Top actor: {cell.topActors[0].split('@')[0]}
                            </div>
                          )}
                        </div>
                      }
                      arrow
                    >
                      <div
                        className={classes.cell}
                        onClick={() =>
                          setSelectedCell(isSelected ? null : cell)
                        }
                        style={{
                          background: pal.bg,
                          color: pal.text,
                          borderColor: isSelected ? pal.text : pal.border,
                          borderWidth: isSelected ? 2 : 1,
                          boxShadow: isSelected
                            ? `0 0 0 3px ${pal.text}40`
                            : undefined,
                        }}
                      >
                        <span className={classes.cellScore}>
                          {cell.frictionScore > 0 ? cell.frictionScore : '—'}
                        </span>
                        {cell.severity !== 'none' && (
                          <span className={classes.cellCount}>
                            {cell.deviationCount} event
                            {cell.deviationCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Legend ── */}
        <Box
          display="flex"
          alignItems="center"
          style={{ gap: 16, flexWrap: 'wrap' }}
        >
          <Typography
            style={{
              fontSize: '0.65rem',
              color: '#94A3B8',
              fontFamily: 'monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Legend:
          </Typography>
          {(['none', 'low', 'medium', 'high', 'critical'] as const).map(sev => (
            <span key={sev}>
              <span
                className={classes.legendDot}
                style={{
                  background: SEVERITY_PALETTE[sev].bg,
                  border: `1px solid ${SEVERITY_PALETTE[sev].border}`,
                }}
              />
              <span className={classes.legendLabel}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </span>
            </span>
          ))}
          <Typography
            style={{
              fontSize: '0.62rem',
              color: '#CBD5E1',
              fontFamily: 'monospace',
              marginLeft: 'auto',
            }}
          >
            Rows = workflows · Columns = event types · Click any cell for
            details
          </Typography>
        </Box>

        {/* ── Drill-down panel ── */}
        {selectedCell && (
          <DrillDownPanel
            cell={selectedCell}
            onClose={() => setSelectedCell(null)}
          />
        )}
      </Box>
    </InfoCard>
  );
}

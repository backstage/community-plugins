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
 * Renders a "Friction Analysis Board" card on any Backstage entity page.
 * Fetches real-time friction data from the self-hosted Healert backend and
 * presents it with interactive filters, a score details modal, and a PDF report.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CARD SECTIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. Friction Score circle   — Clickable. Opens the Score Details modal.
 *  2. Summary metric cards    — Total Bypasses, Overhead/Eng (clickable),
 *                               Top Workflow (clickable), Top Actor (clickable).
 *  3. Breakdown by Type chips — Clickable filters for the events table.
 *  4. Friction events table   — Paginated (5/10/25/50 per page).
 *  5. Data source indicators  — Active (✓) and planned (○) data sources.
 *
 * SCORE DETAILS MODAL (opens on score circle click)
 *  - Why this score:        Severity explanation + scoring formula
 *  - Top contributors:      Ranked actors with percentage bars
 *  - How to decrease score: Per-type fix cards with Impact/Effort ratings
 *  - Projected improvement: Estimated score after fixing top 2 event types
 *  - Download PDF Report:   Full multi-page A4 PDF generated in the browser
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTERACTIVE FILTERS (all AND-combined, reset via "✕ clear all filters")
 * ─────────────────────────────────────────────────────────────────────────────
 *  Click a Type chip       → Show only events of that event type
 *  Click severity badge    → Show only the highest-frequency event type
 *  Click Top Actor card    → Show only events from that actor
 *  Click Top Workflow card → Show only events from that workflow
 *  Click Overhead/Eng card → Show only high-overhead event types
 *                            (types with scoring weight ≥ OVERHEAD_THRESHOLD)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PDF REPORT STRUCTURE
 * ─────────────────────────────────────────────────────────────────────────────
 *  Page 1:  Cover + summary metrics + why this score + breakdown by type
 *  Page 2:  Top contributors + how to decrease score + projected improvement
 *  Page 3+: Full events table (auto-paginated)
 *  Footer:  "Healert · Friction Intelligence Platform · healert.io" + page N/M
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PDF DELIVERY
 * ─────────────────────────────────────────────────────────────────────────────
 * jsPDF is loaded lazily via dynamic import('jspdf') when the user clicks
 * "Download PDF Report". It is bundled as a separate chunk and cached by the
 * browser; no external CDN script loading is required.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * KEY DEPENDENCIES
 * ─────────────────────────────────────────────────────────────────────────────
 *  @backstage/core-components   InfoCard, Progress, ResponseErrorPanel
 *  @material-ui/core            Grid, Table, Chip, Dialog, Tooltip, etc.
 *  @material-ui/icons           Warning, Error, CheckCircle, Info, etc.
 *  useFrictionData              Custom hook — reads entity from EntityProvider
 *                               and fetches data from the Healert backend
 */

import { useState } from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Paper,
  TablePagination,
} from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import GetAppIcon from '@material-ui/icons/GetApp';
import { useFrictionData } from '../../hooks/useFrictionData';

// =============================================================================
// 1. CONFIGURATION
//
// All values that could vary between deployments are defined here as named
// constants. No magic numbers, no inline literals, no hardcoded URLs anywhere
// else in this file.
// =============================================================================

/**
 * CDN URL for jsPDF — loaded lazily when the user clicks "Download PDF Report".
 *
 * Override this to point at an internal CDN for air-gapped clusters or
 * environments with a Content-Security-Policy that blocks external scripts.
 * The URL must resolve to the jsPDF UMD bundle (jspdf.umd.min.js).
 *
 * Default: Cloudflare CDN — stable, fast, and globally available.
 */

/**
 * Friction scoring weights — one point value per event type.
 *
 * These weights mirror the backend scoring formula exactly. The backend
 * uses the same values when calculating the Friction Score returned in the
 * API response. Any change to backend scoring must be reflected here.
 *
 * The scoring formula is:
 *   Score = min(100, round(weighted_total / 50 × 100))
 *   weighted_total = Σ(points × 0.5^(age_days / 7))  — exponential time decay
 */
const EVENT_POINTS: Record<string, number> = {
  'kubectl-exec': 10, // Highest weight — direct pod access bypasses GitOps entirely
  'pipeline-skip': 8, // High weight — policy gate explicitly bypassed
  'manual-merge': 6, // Medium weight — code review requirement bypassed
  'platform-ticket': 5, // Medium weight — self-service portal not used
  'emergency-access': 5, // Medium weight — secret accessed outside Break Glass procedure
  'config-drift': 5, // Medium weight — manifest edited directly, bypassing GitOps
};

/**
 * Minimum scoring weight for an event type to appear in the "High Overhead"
 * filter (activated by clicking the Overhead/Eng metric card).
 *
 * Event types with points >= this threshold are considered high-overhead
 * because they require the most investigation and remediation time per event.
 *
 * At the default threshold of 6, the overhead types are:
 *   kubectl-exec (10pts), pipeline-skip (8pts), manual-merge (6pts)
 */
const OVERHEAD_THRESHOLD = 6;

/** Maximum contributors to show in the PDF top-contributors section. */
const PDF_MAX_CONTRIBUTORS = 8;

/** Maximum contributors to show in the Score Details modal. */
const MODAL_MAX_CONTRIBUTORS = 5;

/** Number of top event types used to calculate projected score improvement. */
const PROJECTED_FIX_COUNT = 2;

/** Minimum projected score — prevents showing a score of 0 which would imply perfection. */
const PROJECTED_SCORE_FLOOR = 5;

// =============================================================================
// 2. STYLES
//
// All Material-UI styles are co-located here. Colors that depend on runtime
// data (severity level, event type) are applied inline in JSX using the
// SEVERITY_COLORS and TYPE_COLORS constants defined in Section 3.
// =============================================================================

const useStyles = makeStyles(theme => ({
  // ── Friction score circle ─────────────────────────────────────────────────
  // The primary clickable element. Clicking opens the Score Details modal.
  // Border color is set inline from SEVERITY_COLORS at render time.
  scoreCircle: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: '4px solid',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.06)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    },
  },
  scoreNumber: {
    fontSize: '1.8rem',
    fontWeight: 800,
    lineHeight: 1,
    fontFamily: 'monospace',
  },
  scoreLabel: {
    fontSize: '0.55rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  scoreClickHint: {
    fontSize: '0.5rem',
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // ── Summary metric cards ──────────────────────────────────────────────────
  // Three of the four cards are clickable and receive additional inline styles
  // when their filter is active (border highlight + background tint).
  metaCard: {
    background: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    textAlign: 'center',
    border: `1px solid ${theme.palette.divider}`,
  },
  metaValue: {
    fontSize: '1.4rem',
    fontWeight: 800,
    fontFamily: 'monospace',
    lineHeight: 1.1,
  },
  metaLabel: {
    fontSize: '0.65rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: 4,
  },

  // ── Section title (Breakdown by Type, All Friction Events, etc.) ──────────
  sectionTitle: {
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#64748B',
    fontFamily: 'monospace',
    fontSize: '0.72rem',
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  // ── Event type badge in table rows ────────────────────────────────────────
  // Background and text color are set inline from TYPE_COLORS at render time.
  typeBadge: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
  },

  // ── Events table ──────────────────────────────────────────────────────────
  tableHeader: {
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: theme.palette.text.secondary,
  },
  tableRow: { '&:hover': { background: theme.palette.action.hover } },
  calculatedAt: {
    fontSize: '0.7rem',
    color: theme.palette.text.disabled,
    fontFamily: 'monospace',
  },

  // ── Breakdown by Type filter chips ────────────────────────────────────────
  // Active state (isActive) is handled inline to apply type-specific colors.
  filterChip: {
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontWeight: 700,
    fontSize: '0.72rem',
    '&:hover': { opacity: 0.85, transform: 'translateY(-1px)' },
  },

  // ── "✕ clear all filters" button ─────────────────────────────────────────
  clearFilter: {
    cursor: 'pointer',
    fontSize: '0.65rem',
    color: '#EF4444',
    fontFamily: 'monospace',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
    background: '#FEE2E2',
    border: '1px solid #FCA5A5',
  },

  // ── Score Details modal ───────────────────────────────────────────────────
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    background: '#0F172A',
    color: '#fff',
  },
  modalScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: '4px solid',
    flexShrink: 0,
  },

  // ── Fix recommendation cards (one per event type in the modal) ────────────
  // Left border color set inline to match the event type color.
  fixCard: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: 10,
    borderLeft: '4px solid',
  },

  // ── Impact / Effort badges inside fix cards ───────────────────────────────
  fixBadge: {
    display: 'inline-block',
    fontSize: '0.65rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    padding: '2px 8px',
    borderRadius: 4,
    marginTop: 6,
  },

  // ── Contributor ranking rows in the modal ─────────────────────────────────
  contributorRow: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ── PDF download button ───────────────────────────────────────────────────
  downloadBtn: {
    background: '#0D9488',
    color: '#fff',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: '0.82rem',
    '&:hover': { background: '#0F766E' },
  },
}));

// =============================================================================
// 3. DOMAIN CONSTANTS
//
// Color maps, severity explanations, and fix recommendations. All are defined
// at module level so they can be shared by both the UI components and the PDF
// generator without duplication or inconsistency.
// =============================================================================

/**
 * Maps severity levels to their display colors.
 * Used on the score circle border, severity chip, and inside the PDF.
 */
const SEVERITY_COLORS: Record<string, string> = {
  low: '#10B981', // Green  — healthy adoption
  medium: '#F59E0B', // Amber  — some bypass activity
  high: '#F97316', // Orange — significant bypass activity
  critical: '#EF4444', // Red    — platform adoption is failing
};

/**
 * Maps event type keys to their display styles and human-readable labels.
 *
 * Each type key corresponds to a bypass pattern detected by the Healert agent:
 *   kubectl-exec     → developer ran kubectl exec directly on a running pod
 *   pipeline-skip    → a CI/CD pipeline step or policy gate was bypassed
 *   manual-merge     → PR merged without the required code review approval
 *   platform-ticket  → Jira ticket opened instead of using a scaffolder template
 *   emergency-access → production secret accessed outside the Break Glass procedure
 *   config-drift     → Kubernetes manifest edited directly (not via GitOps)
 *
 * Any event type not listed here falls back to a neutral gray via getTypeStyle(),
 * making this component forward-compatible with new types added in future
 * agent versions without requiring a code change in the plugin.
 */
const TYPE_COLORS: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  'kubectl-exec': { bg: '#FEE2E2', color: '#DC2626', label: 'kubectl exec' },
  'pipeline-skip': { bg: '#FEF3C7', color: '#D97706', label: 'Pipeline Skip' },
  'manual-merge': { bg: '#DBEAFE', color: '#2563EB', label: 'Manual Merge' },
  'platform-ticket': {
    bg: '#EDE9FE',
    color: '#7C3AED',
    label: 'Platform Ticket',
  },
  'emergency-access': {
    bg: '#FFE4E6',
    color: '#BE123C',
    label: 'Emergency Access',
  },
  'config-drift': { bg: '#DCFCE7', color: '#15803D', label: 'Config Drift' },
};

/**
 * Human-readable severity explanations shown in the Score Details modal
 * and included in the PDF report.
 */
const SEVERITY_EXPLANATION: Record<string, { title: string; desc: string }> = {
  critical: {
    title: 'CRITICAL — Platform Adoption is Failing',
    desc: 'Your developers are heavily bypassing the golden path. This indicates fundamental usability problems. Developers have lost trust in the tools and are working around them consistently.',
  },
  high: {
    title: 'HIGH — Significant Bypass Activity',
    desc: 'A high number of golden path deviations are happening. Key areas have friction pushing developers to find shortcuts.',
  },
  medium: {
    title: 'MEDIUM — Some Workflows Are Bypassed',
    desc: 'Platform adoption is partially working. Specific workflows create enough friction that developers occasionally bypass them.',
  },
  low: {
    title: 'LOW — Healthy Platform Adoption',
    desc: 'Developers are mostly following the golden path. Minor friction exists but the platform is working well.',
  },
};

/**
 * Actionable fix recommendations for each event type.
 * Ranked by Impact (benefit to adoption) and Effort (implementation cost)
 * to help platform teams prioritize the highest-return improvements first.
 * Shown in the Score Details modal and included in the PDF report.
 */
const TYPE_FIXES: Record<
  string,
  { title: string; fix: string; impact: string; effort: string }
> = {
  'kubectl-exec': {
    title: 'kubectl exec bypasses detected',
    fix: 'Provide a self-service exec wrapper in Backstage with audit logging. Add a kubectl exec policy via OPA/Gatekeeper. Create scaffolder templates for common debugging tasks so developers never need raw kubectl access.',
    impact: 'High',
    effort: 'Medium',
  },
  'pipeline-skip': {
    title: 'CI/CD pipeline steps being skipped',
    fix: 'Identify and optimize the slowest pipeline steps. Add required status checks in GitHub/GitLab so skipping is impossible. Provide a fast-track pipeline for low-risk changes.',
    impact: 'High',
    effort: 'Medium',
  },
  'manual-merge': {
    title: 'Merges bypassing required code review',
    fix: 'Enforce branch protection rules. Require at least 1 approver for all merges to main. Use CODEOWNERS to automatically assign the right reviewer.',
    impact: 'Medium',
    effort: 'Low',
  },
  'platform-ticket': {
    title: 'Developers filing manual tickets instead of using self-service',
    fix: 'Identify the most common ticket types and build Backstage scaffolder templates for each. Every ticket that recurs 3+ times is a self-service opportunity.',
    impact: 'High',
    effort: 'High',
  },
  'emergency-access': {
    title: 'Emergency direct secret access detected',
    fix: 'Build a self-service secret rotation workflow in Backstage. Add a Break Glass procedure with an automatic audit trail. Link on-call runbooks from the entity page.',
    impact: 'Medium',
    effort: 'Medium',
  },
  'config-drift': {
    title: 'Config drift — manifests edited directly',
    fix: 'Enable ArgoCD drift detection and alerts. Require all manifest changes through GitOps. Add a Backstage link to the ArgoCD app so developers can trigger syncs without kubectl.',
    impact: 'Medium',
    effort: 'Low',
  },
};

/** Returns the human-readable label for an event type key. */
function getTypeLabel(type: string): string {
  return TYPE_COLORS[type]?.label ?? type;
}

/**
 * Derived from EVENT_POINTS + OVERHEAD_THRESHOLD (both in Section 1).
 * Event types with a scoring weight at or above the threshold are classified
 * as high-overhead — they require the most investigation and remediation time.
 * This list updates automatically when EVENT_POINTS or OVERHEAD_THRESHOLD changes.
 */
const OVERHEAD_TYPES: string[] = Object.entries(EVENT_POINTS)
  .filter(([, pts]) => pts >= OVERHEAD_THRESHOLD)
  .map(([type]) => type);

/**
 * Scoring formula lines used in the PDF and modal.
 * Matches backend calculate_score() — exponential time decay.
 * Half-life 7 days, critical threshold 50 points (configurable via healert.sh).
 */
const SCORING_FORMULA_TEXT: string = Object.entries(EVENT_POINTS)
  .sort(([, a], [, b]) => b - a)
  .map(([type, pts]) => `${getTypeLabel(type)}: ${pts}pts`)
  .join('  |  ');

const SCORING_FORMULA_LINE1 =
  'Score = min(100, round(weighted_total ÷ 50 × 100))';
const SCORING_FORMULA_LINE2 = 'weighted_total = Σ(points × 0.5^(age_days ÷ 7))';
const SCORING_FORMULA_LINE3 =
  'Decay: today=100%  7d ago=50%  14d ago=25%  30d ago=~3%';

// =============================================================================
// 4. UTILITY FUNCTIONS
// =============================================================================

/**
 * Returns the display style (bg, color, label) for a given event type.
 * Falls back to a neutral gray for any type not in TYPE_COLORS, ensuring
 * the component renders correctly for new event types added in future
 * agent versions without requiring any plugin code changes.
 */
function getTypeStyle(type: string) {
  return TYPE_COLORS[type] ?? { bg: '#F1F5F9', color: '#475569', label: type };
}

/**
 * Returns the fix recommendation for a given event type.
 * Falls back to a generic recommendation for unknown types.
 */
function getTypeFix(type: string) {
  return (
    TYPE_FIXES[type] ?? {
      title: `${type} events detected`,
      fix: 'Investigate the root cause and build a self-service alternative in Backstage.',
      impact: 'Medium',
      effort: 'Unknown',
    }
  );
}

/**
 * Renders the severity icon for the given severity level.
 * Used inside the severity badge chip in the InfoCard action area.
 */
function SeverityIcon({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity] ?? '#64748B';
  switch (severity) {
    case 'critical':
      return <ErrorIcon style={{ color, fontSize: 18 }} />;
    case 'high':
      return <WarningIcon style={{ color, fontSize: 18 }} />;
    case 'medium':
      return <InfoIcon style={{ color, fontSize: 18 }} />;
    default:
      return <CheckCircleIcon style={{ color, fontSize: 18 }} />;
  }
}

/**
 * Converts an ISO 8601 timestamp to a human-friendly relative time string.
 * Examples: "42s ago", "15m ago", "3h ago", "2d ago"
 */
function relativeTime(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Formats an ISO 8601 timestamp to a full locale date/time string.
 * Used as a tooltip on hover over relative timestamps in the events table.
 */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

/**
 * Converts a CSS hex color string (#DC2626) to an RGB tuple for jsPDF.
 * Falls back to mid-gray if the hex string cannot be parsed.
 */
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.match(/\w\w/g);
  return m
    ? [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)]
    : [100, 116, 139]; // slate-500 fallback
}

// =============================================================================
// 5. PDF LOADER
//
// jsPDF is loaded lazily via dynamic import('jspdf') only when the user clicks
// "Download PDF Report". Most bundlers will split this into a separate chunk,
// keeping the initial plugin bundle smaller while avoiding external CDN scripts.
// Subsequent downloads reuse the cached module instance.
// =============================================================================

/**
 * Lazily loads jsPDF via dynamic import from the bundled npm package.
 * Only loaded when the user clicks "Download PDF Report" — keeps the
 * initial bundle small. Works behind corporate firewalls and strict CSPs.
 */

async function loadJsPDF(): Promise<typeof import('jspdf').jsPDF> {
  const jspdfModule = await import('jspdf');
  return jspdfModule.jsPDF ?? jspdfModule.default;
}

// =============================================================================
// 6. PDF GENERATOR
//
// Generates a multi-page A4 PDF report entirely in the browser using jsPDF.
// No server-side rendering required. All content is derived from the same data
// already displayed in the UI — no additional API calls are made.
//
// Page 1:  Cover (entity ref + score badge) + summary metrics + why this score
//          + scoring formula + breakdown by event type (bar chart)
// Page 2:  Top contributors (ranked) + how to decrease the score (fix cards)
//          + projected score after fixing top PROJECTED_FIX_COUNT event types
// Page 3+: All friction events table (auto-paginated at the bottom margin)
// Footer:  Healert branding + page N of M on every page
//
// Filename: healert-report-{entity-ref}-{YYYY-MM-DD}.pdf
// =============================================================================

async function generatePDF(
  frictionScore: any,
  recentEvents: any[],
  byType: Record<string, number>,
  byActor: Record<string, number>,
  entityRef: string,
): Promise<void> {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // A4 dimensions and shared layout constants
  const PAGE_W = 210; // mm
  const MARGIN = 15; // mm — left/right margin
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const FOOTER_Y = 287; // mm — top of footer band
  const PAGE_BOTTOM = 278; // mm — max y before adding a new page

  type RGB = [number, number, number];

  // ── PDF color palette (RGB tuples for jsPDF) ──────────────────────────────
  const PDF_COLORS = {
    teal: [13, 148, 136] as RGB,
    navy: [15, 23, 42] as RGB,
    gray: [100, 116, 139] as RGB,
    light: [248, 250, 252] as RGB,
    white: [255, 255, 255] as RGB,
  };

  // Severity color for the score badge — derived from SEVERITY_COLORS
  const severityHex = SEVERITY_COLORS[frictionScore.severity] ?? '#64748B';
  const scoreColor = hexToRgb(severityHex);

  // Impact/effort badge colors
  const impactColor = (level: string): RGB =>
    level === 'High'
      ? [239, 68, 68]
      : level === 'Medium'
      ? [245, 158, 11]
      : [16, 185, 129];
  const effortColor = (level: string): RGB =>
    level === 'Low'
      ? [16, 185, 129]
      : level === 'Medium'
      ? [245, 158, 11]
      : [239, 68, 68];

  let y = 0; // current vertical position — incremented as each section is drawn

  // ── PAGE 1: COVER ──────────────────────────────────────────────────────────
  const COVER_H = 58;
  doc.setFillColor(...PDF_COLORS.navy);
  doc.rect(0, 0, PAGE_W, COVER_H, 'F');

  doc.setTextColor(...PDF_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('Healert', MARGIN, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Friction Intelligence Report', MARGIN, 31);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Entity: ${entityRef}`, MARGIN, 40);
  doc.text(`Generated: ${new Date().toLocaleString()}`, MARGIN, 47);

  // Score badge — top-right of the cover
  const BADGE_X = 154,
    BADGE_Y = 10,
    BADGE_W = 40,
    BADGE_H = 38;
  doc.setFillColor(...scoreColor);
  doc.roundedRect(BADGE_X, BADGE_Y, BADGE_W, BADGE_H, 4, 4, 'F');
  doc.setTextColor(...PDF_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(String(frictionScore.score), BADGE_X + BADGE_W / 2, BADGE_Y + 20, {
    align: 'center',
  });
  doc.setFontSize(7);
  doc.text('FRICTION SCORE', BADGE_X + BADGE_W / 2, BADGE_Y + 27, {
    align: 'center',
  });
  doc.text(
    frictionScore.severity.toUpperCase(),
    BADGE_X + BADGE_W / 2,
    BADGE_Y + 33,
    { align: 'center' },
  );

  y = COVER_H + 8;

  // ── SUMMARY METRICS ROW ────────────────────────────────────────────────────
  const METRICS_H = 26;
  const METRIC_COL_W = CONTENT_W / 4;

  doc.setFillColor(...PDF_COLORS.light);
  doc.rect(MARGIN, y, CONTENT_W, METRICS_H, 'F');

  const summaryMetrics = [
    { label: 'Total Bypasses', value: String(frictionScore.bypassCount) },
    {
      label: 'Overhead / Eng',
      value: `${frictionScore.overheadHoursPerEngineer}h`,
    },
    { label: 'Top Workflow', value: frictionScore.topFrictionWorkflow ?? '—' },
    { label: 'Total Events', value: String(recentEvents.length) },
  ];

  summaryMetrics.forEach((m, i) => {
    const x = MARGIN + i * METRIC_COL_W + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...PDF_COLORS.teal);
    doc.text(m.value, x, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.gray);
    doc.text(m.label.toUpperCase(), x, y + 18);
  });

  y += METRICS_H + 6;

  // ── WHY THIS SCORE ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.teal);
  doc.text('WHY THIS SCORE', MARGIN, y);
  y += 4;
  doc.setDrawColor(...PDF_COLORS.teal);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  const sevInfo = SEVERITY_EXPLANATION[frictionScore.severity];
  if (sevInfo) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text(sevInfo.title, MARGIN, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.gray);
    const descLines = doc.splitTextToSize(sevInfo.desc, CONTENT_W);
    doc.text(descLines, MARGIN, y);
    y += descLines.length * 4.5;
  }
  y += 3;

  // Scoring formula — exponential time decay, matches backend calculate_score()
  const FORMULA_BOX_H = 30;
  doc.setFillColor(240, 253, 250);
  doc.rect(MARGIN, y, CONTENT_W, FORMULA_BOX_H, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.teal);
  doc.text('HOW THE SCORE IS CALCULATED', MARGIN + 5, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(SCORING_FORMULA_TEXT, MARGIN + 5, y + 12);
  doc.text(SCORING_FORMULA_LINE1, MARGIN + 5, y + 18);
  doc.text(SCORING_FORMULA_LINE2, MARGIN + 5, y + 23);
  doc.setTextColor(...PDF_COLORS.gray);
  doc.text(SCORING_FORMULA_LINE3, MARGIN + 5, y + 28);
  y += FORMULA_BOX_H + 6;

  // ── BREAKDOWN BY EVENT TYPE ────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.teal);
  doc.text('BREAKDOWN BY EVENT TYPE', MARGIN, y);
  y += 4;
  doc.setDrawColor(...PDF_COLORS.teal);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  const BAR_X = 80;
  const BAR_MAX_W = CONTENT_W - (BAR_X - MARGIN);

  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const t = getTypeStyle(type);
      const pct = Math.round((count / Math.max(recentEvents.length, 1)) * 100);
      const barW = Math.max(2, (BAR_MAX_W * pct) / 100);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...PDF_COLORS.navy);
      doc.text(t.label, MARGIN, y);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(BAR_X, y - 4, BAR_MAX_W, 5, 2, 2, 'F');
      doc.setFillColor(...hexToRgb(t.color));
      doc.roundedRect(BAR_X, y - 4, barW, 5, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...PDF_COLORS.gray);
      doc.text(`${count} (${pct}%)`, PAGE_W - MARGIN + 1, y, {
        align: 'right',
      });
      y += 8;
    });
  y += 4;

  // ── TOP FRICTION CONTRIBUTORS ──────────────────────────────────────────────
  if (y > PAGE_BOTTOM) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.teal);
  doc.text('TOP FRICTION CONTRIBUTORS', MARGIN, y);
  y += 4;
  doc.setDrawColor(...PDF_COLORS.teal);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  Object.entries(byActor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, PDF_MAX_CONTRIBUTORS)
    .forEach(([actor, count], i) => {
      const pct = Math.round((count / Math.max(recentEvents.length, 1)) * 100);
      const rowBg: RGB = i % 2 === 0 ? PDF_COLORS.light : PDF_COLORS.white;

      doc.setFillColor(...rowBg);
      doc.rect(MARGIN, y - 4, CONTENT_W, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...PDF_COLORS.gray);
      doc.text(`#${i + 1}`, MARGIN + 3, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_COLORS.navy);
      doc.text(actor, MARGIN + 13, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_COLORS.teal);
      doc.text(`${count} events (${pct}%)`, PAGE_W - MARGIN, y, {
        align: 'right',
      });
      y += 9;
    });
  y += 4;

  // ── HOW TO DECREASE THE SCORE ──────────────────────────────────────────────
  if (y > PAGE_BOTTOM) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.teal);
  doc.text('HOW TO DECREASE THE SCORE', MARGIN, y);
  y += 4;
  doc.setDrawColor(...PDF_COLORS.teal);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  const FIX_CARD_H = 35;

  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      if (y > PAGE_BOTTOM - FIX_CARD_H) {
        doc.addPage();
        y = 20;
      }

      const fix = getTypeFix(type);
      const t = getTypeStyle(type);
      const ic = impactColor(fix.impact);
      const ec = effortColor(fix.effort);

      doc.setFillColor(...hexToRgb(t.color));
      doc.rect(MARGIN, y, 3, FIX_CARD_H, 'F');
      doc.setFillColor(...PDF_COLORS.light);
      doc.rect(MARGIN + 3, y, CONTENT_W - 3, FIX_CARD_H, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...PDF_COLORS.navy);
      doc.text(fix.title, MARGIN + 7, y + 6);
      doc.setFontSize(7);
      doc.setTextColor(...hexToRgb(t.color));
      doc.text(`${count} events`, PAGE_W - MARGIN - 1, y + 6, {
        align: 'right',
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...PDF_COLORS.gray);
      const fixLines = doc.splitTextToSize(fix.fix, CONTENT_W - 20);
      doc.text(fixLines.slice(0, 2), MARGIN + 7, y + 12);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...ic);
      doc.text(`Impact: ${fix.impact}`, MARGIN + 7, y + 27);
      doc.setTextColor(...ec);
      doc.text(`Effort: ${fix.effort}`, MARGIN + 43, y + 27);
      y += FIX_CARD_H;
    });

  // ── PROJECTED SCORE ────────────────────────────────────────────────────────
  if (y > PAGE_BOTTOM) {
    doc.addPage();
    y = 20;
  }

  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const projectedRed = Math.round(
    (topTypes.slice(0, PROJECTED_FIX_COUNT).reduce((sum, [, c]) => sum + c, 0) /
      Math.max(recentEvents.length, 1)) *
      frictionScore.score,
  );
  const projectedScore = Math.max(
    PROJECTED_SCORE_FLOOR,
    frictionScore.score - projectedRed,
  );

  // Only show projected score in PDF when score > 0 and there is something to improve
  if (frictionScore.score > 0 && projectedRed > 0) {
    const PROJ_BOX_H = 28;
    doc.setFillColor(240, 253, 250);
    doc.rect(MARGIN, y, CONTENT_W, PROJ_BOX_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text(
      `PROJECTED SCORE AFTER FIXING TOP ${PROJECTED_FIX_COUNT} EVENT TYPES`,
      MARGIN + 5,
      y + 7,
    );
    doc.setFontSize(22);
    doc.setTextColor(...scoreColor);
    doc.text(String(frictionScore.score), MARGIN + 5, y + 21);
    doc.setFontSize(10);
    doc.setTextColor(...PDF_COLORS.gray);
    doc.text('to', MARGIN + 20, y + 21);
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text(`~${projectedScore}`, MARGIN + 24, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text(
      `Fixing top ${PROJECTED_FIX_COUNT} event types could reduce score by ~${projectedRed} points`,
      MARGIN + 45,
      y + 18,
    );
    y += PROJ_BOX_H + 4;
  }

  // ── ALL EVENTS TABLE ───────────────────────────────────────────────────────
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.teal);
  doc.text('ALL FRICTION EVENTS', MARGIN, y);
  y += 4;
  doc.setDrawColor(...PDF_COLORS.teal);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  // Table column x-positions
  const COL = {
    type: MARGIN + 3,
    actor: 55,
    workflow: 95,
    desc: 130,
    time: PAGE_W - MARGIN,
  };

  doc.setFillColor(...PDF_COLORS.navy);
  doc.rect(MARGIN, y - 4, CONTENT_W, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.white);
  doc.text('Type', COL.type, y);
  doc.text('Actor', COL.actor, y);
  doc.text('Workflow', COL.workflow, y);
  doc.text('Description', COL.desc, y);
  doc.text('Time', COL.time - 2, y, { align: 'right' });
  y += 6;

  recentEvents.forEach((event, i) => {
    if (y > PAGE_BOTTOM) {
      doc.addPage();
      y = 20;
    }

    const t = getTypeStyle(event.type);
    const rowBg: RGB = i % 2 === 0 ? PDF_COLORS.light : PDF_COLORS.white;

    doc.setFillColor(...rowBg);
    doc.rect(MARGIN, y - 4, CONTENT_W, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...hexToRgb(t.color));
    doc.text(t.label, COL.type, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text(
      String(event.actor ?? '')
        .split('@')[0]
        .slice(0, 12),
      COL.actor,
      y,
    );
    doc.text(String(event.workflow ?? '—').slice(0, 10), COL.workflow, y);
    doc.text(String(event.description ?? '—').slice(0, 30), COL.desc, y);
    doc.setTextColor(...PDF_COLORS.gray);
    doc.text(relativeTime(event.timestamp), COL.time - 2, y, {
      align: 'right',
    });
    y += 8;
  });

  // ── FOOTER — applied to every page after all content is rendered ───────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let pg = 1; pg <= pageCount; pg++) {
    doc.setPage(pg);
    doc.setFillColor(...PDF_COLORS.navy);
    doc.rect(0, FOOTER_Y, PAGE_W, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Healert · Friction Intelligence Platform · healert.io',
      MARGIN,
      FOOTER_Y + 6,
    );
    doc.text(`Page ${pg} of ${pageCount}`, PAGE_W - MARGIN, FOOTER_Y + 6, {
      align: 'right',
    });
  }

  // ── SAVE ───────────────────────────────────────────────────────────────────
  const filename = `healert-report-${entityRef.replace(
    /[:/]/g,
    '-',
  )}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

// =============================================================================
// 7. SCORE DETAILS MODAL
//
// Opens when the user clicks the friction score circle.
// Shows four sections:
//   1. Why this score    — severity explanation + scoring formula
//   2. Top contributors  — ranked actors with percentage bars
//   3. How to fix        — one fix card per detected type with Impact/Effort
//   4. Projected score   — estimated score after fixing top PROJECTED_FIX_COUNT types
//
// The modal header contains the Download PDF Report button which triggers
// generatePDF() above.
// =============================================================================

function ScoreDetailsModal({
  open,
  onClose,
  frictionScore,
  recentEvents,
  byType,
  byActor,
  entityRef,
}: {
  open: boolean;
  onClose: () => void;
  frictionScore: any;
  recentEvents: any[];
  byType: Record<string, number>;
  byActor: Record<string, number>;
  entityRef: string;
}) {
  const classes = useStyles();
  const color = SEVERITY_COLORS[frictionScore.severity] ?? '#64748B';
  const sevInfo = SEVERITY_EXPLANATION[frictionScore.severity];

  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const topActors = Object.entries(byActor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MODAL_MAX_CONTRIBUTORS);

  const [downloading, setDownloading] = useState(false);

  const projectedRed = Math.round(
    (topTypes.slice(0, PROJECTED_FIX_COUNT).reduce((sum, [, c]) => sum + c, 0) /
      Math.max(recentEvents.length, 1)) *
      frictionScore.score,
  );
  const projectedScore = Math.max(
    PROJECTED_SCORE_FLOOR,
    frictionScore.score - projectedRed,
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generatePDF(
        frictionScore,
        recentEvents,
        byType,
        byActor,
        entityRef,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* ── Header: score circle + title + PDF download button ── */}
      <div className={classes.dialogHeader}>
        <Box display="flex" alignItems="center" style={{ gap: 16 }}>
          <div
            className={classes.modalScoreCircle}
            style={{ borderColor: color }}
          >
            <span
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color,
                fontFamily: 'monospace',
                lineHeight: 1,
              }}
            >
              {frictionScore.score}
            </span>
            <span
              style={{
                fontSize: '0.5rem',
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              /100
            </span>
          </div>
          <div>
            <Typography
              style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}
            >
              Friction Score Analysis Card
            </Typography>
            <Typography
              style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                fontFamily: 'monospace',
              }}
            >
              {frictionScore.bypassCount} bypass events ·{' '}
              {frictionScore.overheadHoursPerEngineer}h overhead/engineer/month
            </Typography>
          </div>
        </Box>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <Button
            variant="contained"
            className={classes.downloadBtn}
            startIcon={<GetAppIcon />}
            onClick={handleDownload}
            disabled={downloading}
            size="small"
          >
            {downloading ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
          <IconButton
            size="small"
            onClick={onClose}
            style={{ color: '#64748B' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </div>

      <DialogContent style={{ padding: 24 }}>
        <Box display="flex" flexDirection="column" style={{ gap: 24 }}>
          {/* ── Section 1: Why this score ── */}
          <div>
            <Typography className={classes.sectionTitle}>
              Why this score?
            </Typography>

            {/* Severity explanation */}
            <Box
              style={{
                background: `${color}10`,
                border: `1.5px solid ${color}30`,
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <Typography
                style={{
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color,
                  marginBottom: 6,
                }}
              >
                {sevInfo?.title}
              </Typography>
              <Typography
                style={{
                  fontSize: '0.82rem',
                  color: '#475569',
                  lineHeight: 1.7,
                }}
              >
                {sevInfo?.desc}
              </Typography>
            </Box>

            {/* Scoring formula — derived from EVENT_POINTS, never hardcoded */}
            <Box
              style={{
                marginTop: 12,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '12px 16px',
              }}
            >
              <Typography
                style={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#64748B',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                How the score is calculated
              </Typography>
              <Box
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}
              >
                {Object.entries(EVENT_POINTS)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, pts]) => {
                    const t = getTypeStyle(type);
                    return (
                      <span
                        key={type}
                        style={{
                          background: t.bg,
                          color: t.color,
                          fontFamily: 'monospace',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 4,
                        }}
                      >
                        {t.label}: {pts}pts
                      </span>
                    );
                  })}
              </Box>
              <Typography
                style={{
                  fontSize: '0.70rem',
                  color: '#475569',
                  fontFamily: 'monospace',
                  marginBottom: 4,
                }}
              >
                Score = min(100, round(weighted_total ÷ 50 × 100))
              </Typography>
              <Typography
                style={{
                  fontSize: '0.70rem',
                  color: '#475569',
                  fontFamily: 'monospace',
                  marginBottom: 8,
                }}
              >
                weighted_total = Σ (points × 0.5^(age_days ÷ 7))
              </Typography>
              <Box style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  {
                    label: 'today',
                    weight: '100%',
                    bg: '#DCFCE7',
                    color: '#16A34A',
                  },
                  {
                    label: '7d ago',
                    weight: '50%',
                    bg: '#FEF9C3',
                    color: '#CA8A04',
                  },
                  {
                    label: '14d ago',
                    weight: '25%',
                    bg: '#FEF3C7',
                    color: '#D97706',
                  },
                  {
                    label: '30d ago',
                    weight: '~3%',
                    bg: '#FEE2E2',
                    color: '#DC2626',
                  },
                ].map(({ label, weight, bg, color: c }) => (
                  <span
                    key={label}
                    style={{
                      background: bg,
                      color: c,
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {label} = {weight}
                  </span>
                ))}
              </Box>
              <Typography
                style={{
                  fontSize: '0.65rem',
                  color: '#94A3B8',
                  fontFamily: 'monospace',
                  marginTop: 8,
                }}
              >
                Score decays automatically — no manual reset needed.
              </Typography>
            </Box>
          </div>

          <Divider />

          {/* ── Section 2: Top contributors ── */}
          <div>
            <Typography className={classes.sectionTitle}>
              Top Friction Contributors
            </Typography>
            {topActors.map(([actor, count], i) => {
              const pct = Math.round(
                (count / Math.max(recentEvents.length, 1)) * 100,
              );
              return (
                <div key={actor} className={classes.contributorRow}>
                  <Box display="flex" alignItems="center" style={{ gap: 10 }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        color: '#94A3B8',
                        fontWeight: 700,
                        minWidth: 20,
                      }}
                    >
                      #{i + 1}
                    </span>
                    <div>
                      <Typography
                        style={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#0F172A',
                        }}
                      >
                        {actor}
                      </Typography>
                      <Typography
                        style={{
                          fontSize: '0.68rem',
                          color: '#94A3B8',
                          fontFamily: 'monospace',
                        }}
                      >
                        {count} bypass events
                      </Typography>
                    </div>
                  </Box>
                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                    <div
                      style={{
                        width: 80,
                        height: 6,
                        background: '#E2E8F0',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: color,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        color,
                        fontWeight: 700,
                      }}
                    >
                      {pct}%
                    </span>
                  </Box>
                </div>
              );
            })}
          </div>

          <Divider />

          {/* ── Section 3: How to decrease the score ── */}
          <div>
            <Box
              display="flex"
              alignItems="center"
              style={{ gap: 8, marginBottom: 12 }}
            >
              <TrendingDownIcon style={{ color: '#10B981', fontSize: 18 }} />
              <Typography className={classes.sectionTitle}>
                How to Decrease the Score
              </Typography>
            </Box>
            {topTypes.map(([type, count]) => {
              const fix = getTypeFix(type);
              const t = getTypeStyle(type);
              const impactColor =
                fix.impact === 'High'
                  ? '#EF4444'
                  : fix.impact === 'Medium'
                  ? '#F59E0B'
                  : '#10B981';
              const effortColor =
                fix.effort === 'Low'
                  ? '#10B981'
                  : fix.effort === 'Medium'
                  ? '#F59E0B'
                  : '#EF4444';
              return (
                <div
                  key={type}
                  className={classes.fixCard}
                  style={{ borderLeftColor: t.color }}
                >
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Typography
                      style={{
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color: '#0F172A',
                        marginBottom: 4,
                      }}
                    >
                      {fix.title}
                    </Typography>
                    <span
                      style={{
                        background: t.bg,
                        color: t.color,
                        fontFamily: 'monospace',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {count} events
                    </span>
                  </Box>
                  <Typography
                    style={{
                      fontSize: '0.78rem',
                      color: '#475569',
                      lineHeight: 1.7,
                    }}
                  >
                    {fix.fix}
                  </Typography>
                  <Box display="flex" style={{ gap: 6, marginTop: 8 }}>
                    <span
                      className={classes.fixBadge}
                      style={{
                        background: `${impactColor}15`,
                        color: impactColor,
                      }}
                    >
                      Impact: {fix.impact}
                    </span>
                    <span
                      className={classes.fixBadge}
                      style={{
                        background: `${effortColor}15`,
                        color: effortColor,
                      }}
                    >
                      Effort: {fix.effort}
                    </span>
                  </Box>
                </div>
              );
            })}
          </div>

          <Divider />

          {/* ── Section 4: Projected score — only shown when score > 0 ── */}
          {frictionScore.score > 0 && projectedRed > 0 && (
            <div>
              <Typography className={classes.sectionTitle}>
                Projected Score After Fixing Top {PROJECTED_FIX_COUNT} Event
                Types
              </Typography>
              <Box
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 8,
                  padding: '12px 16px',
                }}
              >
                <Box display="flex" alignItems="center" style={{ gap: 16 }}>
                  <div>
                    <Typography
                      style={{
                        fontSize: '0.68rem',
                        color: '#64748B',
                        fontFamily: 'monospace',
                      }}
                    >
                      Current
                    </Typography>
                    <Typography
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color,
                      }}
                    >
                      {frictionScore.score}
                    </Typography>
                  </div>
                  <TrendingDownIcon
                    style={{ color: '#10B981', fontSize: 28 }}
                  />
                  <div>
                    <Typography
                      style={{
                        fontSize: '0.68rem',
                        color: '#64748B',
                        fontFamily: 'monospace',
                      }}
                    >
                      After fixes
                    </Typography>
                    <Typography
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: '#10B981',
                      }}
                    >
                      ~{projectedScore}
                    </Typography>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Typography
                      style={{
                        fontSize: '0.78rem',
                        color: '#166534',
                        lineHeight: 1.6,
                      }}
                    >
                      Fixing{' '}
                      <strong>
                        {topTypes
                          .slice(0, PROJECTED_FIX_COUNT)
                          .map(([t]) => getTypeStyle(t).label)
                          .join(' + ')}
                      </strong>{' '}
                      could reduce your score by{' '}
                      <strong style={{ color: '#10B981' }}>
                        {projectedRed} points
                      </strong>
                      .
                    </Typography>
                  </div>
                </Box>
              </Box>
            </div>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// 8. MAIN COMPONENT — FrictionScoreCard
//
// Exported component mounted by EntityHealertContent as the Platform Health tab.
// Reads the current entity from Backstage EntityProvider context via the
// useFrictionData hook, fetches friction data from the Healert backend, and
// renders the card with all interactive features.
//
// RENDER STATES:
//   loading → Backstage <Progress /> linear bar inside the InfoCard
//   error   → Backstage <ResponseErrorPanel /> with the error message
//   ready   → Full card with score, filters, events table, and modal
//
// FILTER STATE (all useState hooks are declared before any early returns):
//   activeFilter   → event type string | null
//   actorFilter    → actor email string | null
//   workflowFilter → workflow name string | null
//   sevFilter      → boolean — shows only the highest-frequency event type
//   overheadFilter → boolean — shows only event types in OVERHEAD_TYPES
//   All five filters are AND-combined. hasFilter drives the clear button.
// =============================================================================

/** @public */
export function FrictionScoreCard() {
  const classes = useStyles();
  const { data, loading, error } = useFrictionData();

  // All useState hooks must be declared before any conditional early returns
  // to satisfy React's Rules of Hooks.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRows] = useState(10);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [actorFilter, setActorFilter] = useState<string | null>(null);
  const [workflowFilter, setWorkflowFilter] = useState<string | null>(null);
  const [sevFilter, setSevFilter] = useState(false);
  const [overheadFilter, setOverheadFilter] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <InfoCard title="Friction Analysis Board">
        <Progress />
      </InfoCard>
    );
  }

  // ── Error / empty states ────────────────────────────────────────────────────
  // Never uses ResponseErrorPanel (shows raw red technical errors).
  // Instead shows amber/blue boxes with clear operator instructions.
  //
  // Error codes from useFrictionData:
  //   "backend-unreachable" → backend not running
  //   "auth-error"          → API key wrong
  //   "not-found"           → no events for this entity yet
  //   null + no data        → backend returned empty / score=0 is fine (not an error)

  if (error === 'not-found') {
    return (
      <InfoCard title="Friction Analysis Board">
        <Box style={{ padding: '40px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: 40 }}>✅</span>
          <Typography
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#065F46',
              marginTop: 12,
            }}
          >
            No friction events recorded
          </Typography>
          <Typography
            style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: 6 }}
          >
            This service has a clean record. No platform bypass events detected
            yet.
          </Typography>
          <Typography
            style={{
              fontSize: '0.78rem',
              color: '#9CA3AF',
              marginTop: 8,
              fontFamily: 'monospace',
            }}
          >
            Score: 0 — Low severity
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (error) {
    const isUnreachable = error === 'backend-unreachable';
    const isAuthError = error === 'auth-error';

    return (
      <InfoCard title="Friction Analysis Board">
        <Box style={{ padding: '24px 16px' }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              background: isAuthError ? '#FFF5F5' : '#FFFBEB',
              border: `1px solid ${isAuthError ? '#DC2626' : '#D97706'}`,
              borderRadius: 8,
              padding: '18px 20px',
            }}
          >
            <span style={{ fontSize: 26, lineHeight: 1, marginTop: 2 }}>
              {isAuthError ? '🔑' : '⚠️'}
            </span>
            <Box>
              {/* Title */}
              <Typography
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: 6,
                  color: isUnreachable
                    ? '#92400E'
                    : isAuthError
                    ? '#991B1B'
                    : '#92400E',
                }}
              >
                {isUnreachable
                  ? 'Healert backend is not reachable'
                  : isAuthError
                  ? 'API key authentication failed'
                  : 'Healert backend or agent is not running'}
              </Typography>

              {/* Description */}
              <Typography
                style={{
                  fontSize: '0.85rem',
                  marginBottom: 12,
                  color: isUnreachable
                    ? '#78350F'
                    : isAuthError
                    ? '#7F1D1D'
                    : '#78350F',
                }}
              >
                {isUnreachable
                  ? 'The Healert backend process is not running or cannot be reached from Backstage.'
                  : isAuthError
                  ? 'The API key configured in Backstage does not match the backend API key.'
                  : 'The backend or agent is not running. Start both to begin detecting friction events.'}
              </Typography>

              {/* Fix instructions */}
              <Box
                style={{
                  background: isUnreachable
                    ? '#FEF3C7'
                    : isAuthError
                    ? '#FEE2E2'
                    : '#FEF3C7',
                  border: `1px solid ${
                    isUnreachable
                      ? '#FCD34D'
                      : isAuthError
                      ? '#FCA5A5'
                      : '#FCD34D'
                  }`,
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: isUnreachable
                    ? '#78350F'
                    : isAuthError
                    ? '#7F1D1D'
                    : '#78350F',
                }}
              >
                {isUnreachable
                  ? './healert.sh start backend'
                  : isAuthError
                  ? './healert.sh setup rotate'
                  : './healert.sh start'}
              </Box>
            </Box>
          </Box>
        </Box>
      </InfoCard>
    );
  }

  // ── Empty state — backend responded but no data yet ─────────────────────────
  // This happens when:
  //   - Entity exists in Backstage but agent has not sent any events yet
  //   - Database was just reset (./healert.sh reset --confirm)
  //   - Score = 0 is NOT an error — it renders normally below
  if (!data) {
    return (
      <InfoCard title="Friction Analysis Board">
        <Box style={{ padding: '40px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: 40 }}>✅</span>
          <Typography
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#065F46',
              marginTop: 12,
            }}
          >
            No friction events recorded
          </Typography>
          <Typography
            style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: 6 }}
          >
            This service has a clean record. No platform bypass events detected.
          </Typography>
          <Typography
            style={{
              fontSize: '0.78rem',
              color: '#9CA3AF',
              marginTop: 8,
              fontFamily: 'monospace',
            }}
          >
            Score: 0 — Low severity
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  // ── Agent not running — backend is up but agent has never connected ─────────
  // Detected by: score=0 AND bypassCount=0 AND sources.kubernetesAuditLog=false
  // This is different from "no events yet" — the agent has never sent anything.
  // When agent is running: sources.kubernetesAuditLog is always true.
  // When agent never connected: sources.kubernetesAuditLog stays false.
  const agentNeverConnected =
    data.frictionScore.score === 0 &&
    data.frictionScore.bypassCount === 0 &&
    data.sources?.kubernetesAuditLog === false;

  if (agentNeverConnected) {
    return (
      <InfoCard title="Friction Analysis Board">
        <Box style={{ padding: '24px 16px' }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              background: '#FFFBEB',
              border: '1px solid #D97706',
              borderRadius: 8,
              padding: '18px 20px',
            }}
          >
            <span style={{ fontSize: 26, lineHeight: 1, marginTop: 2 }}>
              ⚠️
            </span>
            <Box>
              <Typography
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: 6,
                  color: '#92400E',
                }}
              >
                Healert agent is not running
              </Typography>
              <Typography
                style={{
                  fontSize: '0.85rem',
                  marginBottom: 12,
                  color: '#78350F',
                }}
              >
                The backend is reachable but the Go agent has not connected yet.
                No Kubernetes audit log events are being detected.
              </Typography>
              <Box
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#78350F',
                }}
              >
                ./healert.sh start
              </Box>
            </Box>
          </Box>
        </Box>
      </InfoCard>
    );
  }

  const { frictionScore, recentEvents, entityRef } = data;
  const color = SEVERITY_COLORS[frictionScore.severity] ?? '#64748B';
  const sevLabel =
    frictionScore.severity.charAt(0).toUpperCase() +
    frictionScore.severity.slice(1);

  // ── Aggregate events by type and actor ────────────────────────────────────
  const byType: Record<string, number> = {};
  const byActor: Record<string, number> = {};
  recentEvents.forEach((e: any) => {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
    byActor[e.actor] = (byActor[e.actor] ?? 0) + 1;
  });

  const topActor = Object.entries(byActor).sort((a, b) => b[1] - a[1])[0];
  const topFrictionType = Object.entries(byType).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  // ── Apply all active filters (AND-combined) ────────────────────────────────
  const filteredEvents = recentEvents.filter((e: any) => {
    if (activeFilter && e.type !== activeFilter) return false;
    if (actorFilter && e.actor !== actorFilter) return false;
    if (workflowFilter && e.workflow !== workflowFilter) return false;
    if (sevFilter && e.type !== topFrictionType) return false;
    if (overheadFilter && !OVERHEAD_TYPES.includes(e.type)) return false;
    return true;
  });

  const paginated = filteredEvents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const hasFilter = !!(
    activeFilter ||
    actorFilter ||
    workflowFilter ||
    sevFilter ||
    overheadFilter
  );

  // ── Filter handlers ────────────────────────────────────────────────────────

  /** Toggles the event type filter. Clears severity filter to avoid conflict. */
  const handleTypeFilter = (type: string) => {
    setActiveFilter(prev => (prev === type ? null : type));
    setSevFilter(false);
    setPage(0);
  };

  /** Toggles the actor filter. */
  const handleActorClick = (actor: string) => {
    setActorFilter(prev => (prev === actor ? null : actor));
    setPage(0);
  };

  /** Toggles the workflow filter. */
  const handleWorkflowClick = (workflow: string) => {
    setWorkflowFilter(prev => (prev === workflow ? null : workflow));
    setPage(0);
  };

  /**
   * Toggles the severity filter — shows only the highest-frequency event type.
   * Clears type and actor filters to prevent empty results.
   */
  const handleSevFilter = () => {
    setSevFilter(prev => !prev);
    setActiveFilter(null);
    setActorFilter(null);
    setPage(0);
  };

  /**
   * Toggles the overhead filter — shows only event types in OVERHEAD_TYPES
   * (those with scoring weight >= OVERHEAD_THRESHOLD defined in Section 1).
   * Clears type and severity filters to prevent empty results.
   */
  const handleOverheadFilter = () => {
    setOverheadFilter(prev => !prev);
    setActiveFilter(null);
    setSevFilter(false);
    setPage(0);
  };

  /** Resets all five filters and returns to page 1. */
  const clearAllFilters = () => {
    setActiveFilter(null);
    setActorFilter(null);
    setWorkflowFilter(null);
    setSevFilter(false);
    setOverheadFilter(false);
    setPage(0);
  };

  // ── Severity badge — InfoCard action area (top-right) ─────────────────────
  const cardAction = (
    <Tooltip
      title={
        sevFilter
          ? 'Click to clear filter'
          : 'Click to show highest friction events'
      }
      arrow
    >
      <Chip
        size="small"
        label={`${sevLabel} Friction`}
        icon={<SeverityIcon severity={frictionScore.severity} />}
        onClick={handleSevFilter}
        style={{
          background: sevFilter ? color : `${color}20`,
          color: sevFilter ? '#fff' : color,
          fontWeight: 700,
          fontSize: '0.72rem',
          border: `1px solid ${color}40`,
          cursor: 'pointer',
          boxShadow: sevFilter ? `0 2px 8px ${color}50` : 'none',
        }}
      />
    </Tooltip>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Score Details modal — rendered outside InfoCard to avoid z-index conflicts */}
      <ScoreDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        frictionScore={frictionScore}
        recentEvents={recentEvents}
        byType={byType}
        byActor={byActor}
        entityRef={entityRef ?? 'unknown'}
      />

      <InfoCard title="Friction Analysis Board" action={cardAction}>
        <Box display="flex" flexDirection="column" style={{ gap: 24 }}>
          {/* ── SCORE CIRCLE + METRIC CARDS ── */}
          <Grid container spacing={2} alignItems="center">
            {/* Score circle */}
            <Grid item>
              <Tooltip
                title="Click for score details and improvement recommendations"
                arrow
              >
                <Box
                  className={classes.scoreCircle}
                  style={{ borderColor: color }}
                  onClick={() => setModalOpen(true)}
                >
                  <span className={classes.scoreNumber} style={{ color }}>
                    {frictionScore.score}
                  </span>
                  <span className={classes.scoreLabel}>friction</span>
                  <span className={classes.scoreClickHint}>Card Details</span>
                </Box>
              </Tooltip>
            </Grid>

            {/* Four metric cards */}
            <Grid item xs>
              <Grid container spacing={2}>
                {/* Total Bypasses — display only, not clickable */}
                <Grid item xs={6} sm={3}>
                  <div className={classes.metaCard}>
                    <div className={classes.metaValue} style={{ color }}>
                      {frictionScore.bypassCount}
                    </div>
                    <div className={classes.metaLabel}>Total Bypasses</div>
                  </div>
                </Grid>

                {/* Overhead / Eng — clickable, activates overhead filter */}
                <Grid item xs={6} sm={3}>
                  <Tooltip
                    title={
                      overheadFilter
                        ? 'Click to clear overhead filter'
                        : `Click to show high-overhead events (${OVERHEAD_TYPES.map(
                            getTypeLabel,
                          ).join(', ')})`
                    }
                    arrow
                  >
                    <div
                      className={classes.metaCard}
                      onClick={handleOverheadFilter}
                      style={{
                        cursor: 'pointer',
                        background: overheadFilter ? '#FFF7ED' : undefined,
                        border: overheadFilter
                          ? '1.5px solid #F97316'
                          : undefined,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div
                        className={classes.metaValue}
                        style={{
                          color: overheadFilter
                            ? '#F97316'
                            : SEVERITY_COLORS.medium,
                        }}
                      >
                        {frictionScore.overheadHoursPerEngineer}h
                      </div>
                      <div className={classes.metaLabel}>
                        Overhead / Eng{' '}
                        <span style={{ fontSize: '0.55rem' }}>▼ click</span>
                      </div>
                    </div>
                  </Tooltip>
                </Grid>

                {/* Top Workflow — clickable, filters table to this workflow */}
                <Grid item xs={6} sm={3}>
                  <Tooltip
                    title={
                      workflowFilter
                        ? 'Click to clear workflow filter'
                        : `Click to filter by "${frictionScore.topFrictionWorkflow}" workflow`
                    }
                    arrow
                  >
                    <div
                      className={classes.metaCard}
                      onClick={() =>
                        frictionScore.topFrictionWorkflow &&
                        handleWorkflowClick(frictionScore.topFrictionWorkflow)
                      }
                      style={{
                        cursor: 'pointer',
                        background: workflowFilter ? '#F0FDFA' : undefined,
                        border: workflowFilter
                          ? '1.5px solid #0D9488'
                          : undefined,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div
                        className={classes.metaValue}
                        style={{ color: '#0D9488', fontSize: '0.9rem' }}
                      >
                        {frictionScore.topFrictionWorkflow ?? '—'}
                      </div>
                      <div className={classes.metaLabel}>
                        Top Workflow{' '}
                        <span style={{ fontSize: '0.55rem' }}>▼ click</span>
                      </div>
                    </div>
                  </Tooltip>
                </Grid>

                {/* Top Actor — clickable, filters table to this actor */}
                <Grid item xs={6} sm={3}>
                  <Tooltip
                    title={
                      topActor
                        ? actorFilter
                          ? 'Click to clear actor filter'
                          : `Click to filter by ${topActor[0].split('@')[0]}`
                        : ''
                    }
                    arrow
                  >
                    <div
                      className={classes.metaCard}
                      onClick={() => topActor && handleActorClick(topActor[0])}
                      style={{
                        cursor: topActor ? 'pointer' : 'default',
                        background:
                          actorFilter === topActor?.[0] ? '#F3E8FF' : undefined,
                        border:
                          actorFilter === topActor?.[0]
                            ? '1.5px solid #7C3AED'
                            : undefined,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div
                        className={classes.metaValue}
                        style={{ color: '#7C3AED', fontSize: '0.85rem' }}
                      >
                        {topActor ? topActor[0].split('@')[0] : '—'}
                      </div>
                      <div className={classes.metaLabel}>
                        Top Actor{' '}
                        {topActor && (
                          <span style={{ fontSize: '0.55rem' }}>▼ click</span>
                        )}
                      </div>
                    </div>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* ── BREAKDOWN BY TYPE CHIPS ── */}
          <div>
            <Typography className={classes.sectionTitle}>
              Breakdown by Type
              {hasFilter && (
                <span
                  className={classes.clearFilter}
                  onClick={clearAllFilters}
                  role="button"
                >
                  ✕ clear all filters
                </span>
              )}
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(byType).map(([type, count]) => {
                const t = getTypeStyle(type);
                const isActive = activeFilter === type;
                return (
                  <Grid item key={type}>
                    <Chip
                      className={classes.filterChip}
                      label={`${t.label}: ${count}`}
                      onClick={() => handleTypeFilter(type)}
                      style={{
                        background: isActive ? t.color : t.bg,
                        color: isActive ? '#fff' : t.color,
                        border: `1.5px solid ${t.color}`,
                        boxShadow: isActive ? `0 2px 8px ${t.color}40` : 'none',
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>

            {/* Active filter status line */}
            {hasFilter && (
              <Typography
                style={{
                  fontSize: '0.68rem',
                  color: '#64748B',
                  fontFamily: 'monospace',
                  marginTop: 8,
                }}
              >
                Showing {filteredEvents.length} of {recentEvents.length} events
                {activeFilter && (
                  <span>
                    &nbsp;·&nbsp;
                    <span
                      style={{
                        color: getTypeStyle(activeFilter).color,
                        fontWeight: 700,
                      }}
                    >
                      {getTypeStyle(activeFilter).label}
                    </span>{' '}
                    only
                  </span>
                )}
                {actorFilter && (
                  <span>
                    &nbsp;·&nbsp;
                    <span style={{ color: '#7C3AED', fontWeight: 700 }}>
                      {actorFilter.split('@')[0]}
                    </span>{' '}
                    only
                  </span>
                )}
                {workflowFilter && (
                  <span>
                    &nbsp;·&nbsp;
                    <span style={{ color: '#0D9488', fontWeight: 700 }}>
                      {workflowFilter}
                    </span>{' '}
                    workflow only
                  </span>
                )}
                {sevFilter && (
                  <span>
                    &nbsp;·&nbsp;
                    <span style={{ color, fontWeight: 700 }}>
                      Highest friction events only
                    </span>
                  </span>
                )}
                {overheadFilter && (
                  <span>
                    &nbsp;·&nbsp;
                    <span style={{ color: '#F97316', fontWeight: 700 }}>
                      High overhead events only
                    </span>
                  </span>
                )}
              </Typography>
            )}
          </div>

          {/* ── EVENTS TABLE ── */}
          <div>
            {/* Table title updates dynamically to reflect the active filter */}
            <Typography className={classes.sectionTitle}>
              {overheadFilter
                ? `High Overhead Events (${filteredEvents.length})`
                : sevFilter
                ? `Highest Friction Events (${filteredEvents.length})`
                : workflowFilter
                ? `${workflowFilter} Workflow Events (${filteredEvents.length})`
                : actorFilter
                ? `${actorFilter.split('@')[0]} Events (${
                    filteredEvents.length
                  })`
                : activeFilter
                ? `${getTypeStyle(activeFilter).label} Events (${
                    filteredEvents.length
                  })`
                : `All Friction Events (${recentEvents.length})`}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeader}>Type</TableCell>
                    <TableCell className={classes.tableHeader}>Actor</TableCell>
                    <TableCell className={classes.tableHeader}>
                      Workflow
                    </TableCell>
                    <TableCell className={classes.tableHeader}>
                      Description
                    </TableCell>
                    <TableCell className={classes.tableHeader}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          style={{
                            fontSize: '0.8rem',
                            color: '#94A3B8',
                            padding: '16px 0',
                            fontFamily: 'monospace',
                          }}
                        >
                          No events found for this filter
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((event: any) => {
                      const t = getTypeStyle(event.type);
                      return (
                        <TableRow
                          key={`${event.timestamp}-${event.type}-${event.actor}`}
                          className={classes.tableRow}
                        >
                          <TableCell>
                            <span
                              className={classes.typeBadge}
                              style={{ background: t.bg, color: t.color }}
                            >
                              {t.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '0.78rem',
                              }}
                            >
                              {event.actor}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              style={{ fontSize: '0.78rem' }}
                            >
                              {event.workflow}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              style={{ fontSize: '0.78rem', color: '#475569' }}
                            >
                              {event.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '0.72rem',
                                color: '#94A3B8',
                                whiteSpace: 'nowrap',
                              }}
                              title={formatTime(event.timestamp)}
                            >
                              {relativeTime(event.timestamp)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredEvents.length}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={e => {
                  setRows(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
          </div>

          {/* ── DATA SOURCE INDICATORS ── */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            style={{ gap: 8 }}
          >
            <Box display="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label="✓ K8s Audit Log"
                style={{
                  background: '#0D948820',
                  color: '#0D9488',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              />
              <Chip
                size="small"
                label="○ GitHub"
                style={{
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  fontSize: '0.7rem',
                }}
              />
              <Chip
                size="small"
                label="○ ArgoCD"
                style={{
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  fontSize: '0.7rem',
                }}
              />
              <Chip
                size="small"
                label="○ Jira"
                style={{
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  fontSize: '0.7rem',
                }}
              />
              <Chip
                size="small"
                label="○ PagerDuty"
                style={{
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  fontSize: '0.7rem',
                }}
              />
              <Chip
                size="small"
                label="○ GitLab"
                style={{
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  fontSize: '0.7rem',
                }}
              />
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <Typography className={classes.calculatedAt}>
                Updated: {relativeTime(frictionScore.calculatedAt)}
              </Typography>
              <Typography
                style={{
                  fontSize: '0.62rem',
                  color: '#CBD5E1',
                  fontFamily: 'monospace',
                  marginTop: 2,
                }}
              >
                ○ coming in v0.2.0 and v0.3.0
              </Typography>
            </Box>
          </Box>
        </Box>
      </InfoCard>
    </>
  );
}

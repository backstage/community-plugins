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
import {
  EmptyState,
  InfoCard,
  InfoCardVariants,
  Progress,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  CHECKMARX_PROJECT_ID_ANNOTATION,
  CheckmarxEntitySummary,
  isCheckmarxAvailable,
} from '@backstage-community/plugin-checkmarx-react';
import {
  DashboardPanel,
  DashboardPanelIcon,
  SummaryMetric,
  SummaryMetricIcon,
  Tone,
  buildCheckmarxCardViewModel,
} from './checkmarxViewModel';
import { checkmarxApiRef } from '../apiRef';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Theme, alpha, makeStyles, useTheme } from '@material-ui/core/styles';
import ArrowForwardOutlinedIcon from '@material-ui/icons/ArrowForwardOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import ExtensionOutlinedIcon from '@material-ui/icons/ExtensionOutlined';
import GavelOutlinedIcon from '@material-ui/icons/GavelOutlined';
import LayersOutlinedIcon from '@material-ui/icons/LayersOutlined';
import MemoryOutlinedIcon from '@material-ui/icons/MemoryOutlined';
import PolicyOutlinedIcon from '@material-ui/icons/PolicyOutlined';
import ReplayOutlinedIcon from '@material-ui/icons/ReplayOutlined';
import WarningOutlinedIcon from '@material-ui/icons/WarningOutlined';
import useAsync from 'react-use/esm/useAsync';

const useStyles = makeStyles(theme => ({
  content: {
    display: 'grid',
    gap: 0,
  },
  headerBadge: {
    fontWeight: 700,
    backgroundColor: alpha(theme.palette.text.primary, 0.12),
    color: theme.palette.text.primary,
    border: `1px solid ${alpha(theme.palette.text.primary, 0.18)}`,
    '& .MuiChip-icon': {
      color: theme.palette.text.secondary,
      fontSize: 16,
      marginLeft: theme.spacing(1),
    },
  },
  summaryContent: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    rowGap: theme.spacing(2.5),
    alignItems: 'start',
    minHeight: 164,
    padding: theme.spacing(2, 8, 5),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 5, 5),
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      minHeight: 'auto',
      padding: theme.spacing(2, 2.5, 2.5),
    },
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    textAlign: 'center',
  },
  metricWide: {
    gridColumn: 'span 2',
    [theme.breakpoints.down('sm')]: {
      gridColumn: 'auto',
    },
  },
  metricTop: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.625),
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1,
    color: theme.palette.text.primary,
  },
  metricLabel: {
    marginTop: theme.spacing(0.5),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    minWidth: 0,
    color: theme.palette.text.primary,
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      whiteSpace: 'normal',
    },
  },
  metricLabelIcon: {
    fontSize: 16,
    color: theme.palette.text.secondary,
    flexShrink: 0,
  },
  metricIndicator: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-block',
  },
  findingsAge: {
    position: 'absolute',
    left: '50%',
    bottom: theme.spacing(1.5),
    transform: 'translateX(-50%)',
    color: theme.palette.text.secondary,
    fontSize: 12,
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      position: 'static',
      transform: 'none',
      gridColumn: '1 / -1',
      textAlign: 'center',
      marginTop: theme.spacing(0.5),
      whiteSpace: 'normal',
    },
  },
  dashboard: {
    marginTop: theme.spacing(1.25),
    padding: theme.spacing(2.25, 2, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
  panel: {
    minHeight: 154,
  },
  panelTitle: {
    margin: theme.spacing(0, 0, 1.5),
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
  },
  panelTitleIcon: {
    fontSize: 16,
    color: theme.palette.text.secondary,
  },
  barRow: {
    display: 'grid',
    gridTemplateColumns: '92px 1fr 34px',
    gap: theme.spacing(1.25),
    alignItems: 'center',
    margin: theme.spacing(1.25, 0),
    color: theme.palette.text.secondary,
    fontSize: 12,
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '110px 1fr 34px',
    },
  },
  barTrack: {
    height: 9,
    borderRadius: 999,
    background: alpha(theme.palette.text.primary, 0.08),
    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  barValue: {
    color: theme.palette.text.primary,
    fontWeight: 700,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
    color: theme.palette.text.secondary,
    '& td': {
      padding: theme.spacing(0.625, 0),
      borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
    },
    '& td:last-child': {
      textAlign: 'right',
      color: theme.palette.text.primary,
      fontWeight: 700,
    },
  },
  footer: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
  },
  emptyRow: {
    color: theme.palette.text.secondary,
    fontSize: 12,
  },
}));

function getToneColor(theme: Theme, tone: Tone): string {
  switch (tone) {
    case 'danger':
      return theme.palette.error.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'success':
      return theme.palette.success.main;
    case 'info':
      return theme.palette.primary.main;
    case 'muted':
      return theme.palette.text.disabled;
    case 'default':
    default:
      return theme.palette.text.primary;
  }
}

function getMetricIndicatorStyle(
  theme: Theme,
  metric: SummaryMetric,
): React.CSSProperties | undefined {
  if (!metric.indicator) {
    return undefined;
  }

  const toneColor = getToneColor(theme, metric.indicator.tone);

  if (metric.indicator.kind === 'ring') {
    return {
      border: `3px solid ${toneColor}`,
      backgroundColor: 'transparent',
    };
  }

  return {
    backgroundColor: toneColor,
  };
}

function SummaryMetricIconView({
  icon,
  className,
}: {
  icon: SummaryMetricIcon;
  className?: string;
}) {
  switch (icon) {
    case 'language':
      return <CodeOutlinedIcon className={className} />;
    case 'sast':
      return <BugReportOutlinedIcon className={className} />;
    case 'packages':
      return <ExtensionOutlinedIcon className={className} />;
    case 'outdated':
    case 'criticalHigh':
      return <WarningOutlinedIcon className={className} />;
    case 'recurrent':
      return <ReplayOutlinedIcon className={className} />;
    case 'infraApi':
      return <LayersOutlinedIcon className={className} />;
    default:
      return null;
  }
}

function DashboardPanelIconView({
  icon,
  className,
}: {
  icon: DashboardPanelIcon;
  className?: string;
}) {
  switch (icon) {
    case 'severity':
      return <AssessmentOutlinedIcon className={className} />;
    case 'statusAge':
      return <ReplayOutlinedIcon className={className} />;
    case 'packages':
      return <ExtensionOutlinedIcon className={className} />;
    case 'engines':
      return <MemoryOutlinedIcon className={className} />;
    case 'licenses':
      return <GavelOutlinedIcon className={className} />;
    case 'compliance':
      return <PolicyOutlinedIcon className={className} />;
    default:
      return null;
  }
}

function SummaryMetricView({ metric }: { metric: SummaryMetric }) {
  const classes = useStyles();
  const theme = useTheme();
  const metricClassName = `${classes.metric} ${
    metric.span === 2 ? classes.metricWide : ''
  }`;
  const metricStyle = metric.valueTone
    ? { color: getToneColor(theme, metric.valueTone) }
    : undefined;

  return (
    <div className={metricClassName}>
      <div className={classes.metricTop} style={metricStyle}>
        {metric.indicator && (
          <Box
            component="span"
            className={classes.metricIndicator}
            style={getMetricIndicatorStyle(theme, metric)}
            aria-hidden="true"
          />
        )}
        {metric.value}
      </div>
      <div className={classes.metricLabel}>
        <SummaryMetricIconView
          icon={metric.icon}
          className={classes.metricLabelIcon}
        />
        {metric.label}
      </div>
    </div>
  );
}

function DashboardPanelView({ panel }: { panel: DashboardPanel }) {
  const classes = useStyles();
  const theme = useTheme();
  const maxValue = panel.rows.reduce((max, row) => Math.max(max, row.value), 0);
  let panelContent: React.ReactNode;

  if (panel.rows.length === 0) {
    panelContent = <div className={classes.emptyRow}>No data available</div>;
  } else if (panel.kind === 'table') {
    panelContent = (
      <table className={classes.table}>
        <tbody>
          {panel.rows.map(row => (
            <tr key={`${panel.title}-${row.label}`}>
              <td>{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    panelContent = panel.rows.map(row => (
      <div className={classes.barRow} key={`${panel.title}-${row.label}`}>
        <Typography component="span" variant="inherit">
          {row.label}
        </Typography>
        <div className={classes.barTrack}>
          <div
            className={classes.barFill}
            style={{
              width: maxValue > 0 ? `${(row.value / maxValue) * 100}%` : '0%',
              backgroundColor: getToneColor(theme, row.tone ?? 'default'),
            }}
          />
        </div>
        <strong className={classes.barValue}>{row.value}</strong>
      </div>
    ));
  }

  return (
    <section className={classes.panel}>
      <Typography className={classes.panelTitle} component="h3">
        <DashboardPanelIconView
          icon={panel.icon}
          className={classes.panelTitleIcon}
        />
        {panel.title}
      </Typography>
      {panelContent}
    </section>
  );
}

function CheckmarxCardContent({
  summary,
  mode,
}: {
  summary: CheckmarxEntitySummary;
  mode: 'summary' | 'full';
}) {
  const classes = useStyles();
  const viewModel = buildCheckmarxCardViewModel(summary);

  return (
    <div className={classes.content}>
      <section
        className={classes.summaryContent}
        aria-label="Checkmarx metrics summary"
      >
        {viewModel.summaryMetrics.map(metric => (
          <SummaryMetricView key={metric.id} metric={metric} />
        ))}
        <div className={classes.findingsAge}>
          Findings age: {viewModel.findingsAgeLabel}
        </div>
      </section>

      {mode === 'full' && (
        <section
          className={classes.dashboard}
          aria-label="Detailed Checkmarx counters"
        >
          {viewModel.dashboardPanels.map(panel => (
            <DashboardPanelView key={panel.title} panel={panel} />
          ))}
        </section>
      )}

      <footer className={classes.footer}>
        <Link
          className={classes.footerLink}
          href={summary.scanUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View detailed report
          <ArrowForwardOutlinedIcon fontSize="small" />
        </Link>
      </footer>
    </div>
  );
}

function ErrorMessage({ error }: { error: Error }) {
  const statusCode =
    'statusCode' in error ? (error as any).statusCode : undefined;

  if (statusCode === 401) {
    return (
      <EmptyState
        missing="info"
        title="Unauthorized"
        description="The backend could not authenticate against Checkmarx."
      />
    );
  }

  if (statusCode === 403) {
    return (
      <EmptyState
        missing="info"
        title="Forbidden"
        description="The configured Checkmarx credentials do not have access to this project."
      />
    );
  }

  if (statusCode === 404) {
    return (
      <EmptyState
        missing="info"
        title="No completed scan"
        description={error.message}
      />
    );
  }

  return (
    <EmptyState
      missing="info"
      title="Unable to load Checkmarx data"
      description={error.message}
    />
  );
}

/** @public */
export const CheckmarxCard = (props: {
  variant?: InfoCardVariants;
  missingAnnotationReadMoreUrl?: string;
  mode?: 'summary' | 'full';
}) => {
  const {
    variant = 'gridItem',
    missingAnnotationReadMoreUrl,
    mode = 'full',
  } = props;
  const classes = useStyles();
  const { entity } = useEntity();
  const api = useApi(checkmarxApiRef);
  const isAvailable = isCheckmarxAvailable(entity);

  const {
    value: summary,
    loading,
    error,
  } = useAsync(
    async () => (isAvailable ? api.getEntitySummary(entity) : undefined),
    [api, entity, isAvailable],
  );

  const headerBadge = summary
    ? buildCheckmarxCardViewModel(summary).headerBadge
    : undefined;

  return (
    <InfoCard
      title="Checkmarx Security"
      variant={variant}
      headerProps={{
        action:
          !loading && summary && headerBadge ? (
            <Chip
              className={classes.headerBadge}
              label={headerBadge.label}
              size="small"
              icon={<AssessmentOutlinedIcon fontSize="small" />}
              title={headerBadge.tooltip}
              aria-label={headerBadge.ariaLabel}
            />
          ) : undefined,
      }}
    >
      {loading && <Progress />}

      {!loading && !isAvailable && (
        <MissingAnnotationEmptyState
          annotation={CHECKMARX_PROJECT_ID_ANNOTATION}
          readMoreUrl={missingAnnotationReadMoreUrl}
        />
      )}

      {!loading && error && <ErrorMessage error={error} />}

      {!loading && !error && isAvailable && !summary && (
        <EmptyState
          missing="info"
          title="No data available"
          description="The latest completed Checkmarx scan summary is not available for this entity."
        />
      )}

      {!loading && summary && (
        <CheckmarxCardContent summary={summary} mode={mode} />
      )}
    </InfoCard>
  );
};

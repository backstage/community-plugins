import React from 'react';
import { Link, TableColumn } from '@backstage/core-components';
import {
  EntityPeekAheadPopover,
  EntityRefLink,
} from '@backstage/plugin-catalog-react';
import IconButton from '@material-ui/core/IconButton';
import LinkIcon from '@material-ui/icons/Link';
import {
  BugReportRatingCard,
  CodeSmellsRatingCard,
  CoverageRatingCard,
  DuplicationsRatingCard,
  HotspotsReviewed,
  LastAnalyzedRatingCard,
  NoSonarQubeCard,
  QualityBadge,
  VulnerabilitiesRatingCard,
} from '../SonarQubeCard/MetricInsights';
import { EntityLinkProps, SonarQubeTableRow } from './types';

const EntityLink = ({
  entityRef,
  title,
  url,
  kind,
  namespace,
}: EntityLinkProps) => {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0',
        margin: '0',
      }}
    >
      <EntityPeekAheadPopover entityRef={entityRef}>
        <EntityRefLink
          entityRef={{
            kind: kind,
            namespace: namespace,
            name: entityRef.split('/')[1],
          }}
        />
      </EntityPeekAheadPopover>
      <Link to={url} title={title} target="_blank">
        <IconButton
          aria-label="link"
          color="inherit"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0',
            paddingLeft: '10px',
            margin: '0',
          }}
        >
          <LinkIcon />
        </IconButton>
      </Link>
    </span>
  );
};

export const getColumns = (): TableColumn<SonarQubeTableRow>[] => {
  return [
    {
      title: 'Component',
      field: 'resolved.name',
      type: 'string',
      highlight: true,
      align: 'center',
      width: '25%',
      cellStyle: {
        wordBreak: 'inherit',
        padding: '10px 20px',
      },
      render: ({ resolved }) => {
        if (!resolved?.name) {
          return null;
        }
        const scoreCardComponentUrl = `/catalog/default/component/${
          resolved?.name
        }/${resolved?.isSonarQubeAnnotationEnabled ? 'scorecard' : ''}`;
        return (
          <>
            <EntityLink
              entityRef={`component:default/${resolved?.name}`}
              title="View Component details"
              url={scoreCardComponentUrl}
              kind="component"
              namespace="default"
            />
          </>
        );
      },
    },
    {
      title: 'Quality Gate',
      field: 'resolved?.findings?.metrics.alert_status',
      type: 'string',
      align: 'center',
      sorting: false,
      width: '35%',
      render: ({ resolved, id }) => {
        if (resolved?.findings?.metrics) {
          return (
            <div>
              <QualityBadge value={resolved?.findings} />
              <br />
              <LastAnalyzedRatingCard value={resolved?.findings} />
            </div>
          );
        }
        return <NoSonarQubeCard value={resolved} sonarQubeComponentKey={id} />;
      },
    },
    {
      title: 'Bugs',
      field: 'resolved.findings.metrics.bugs',
      align: 'center',
      type: 'numeric',
      width: '5%',
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <BugReportRatingCard value={resolved?.findings} />
        ),
    },
    {
      title: 'Vulnerabilities',
      field: 'resolved.findings.metrics.vulnerabilities',
      align: 'center',
      width: '5%',
      type: 'numeric',
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <VulnerabilitiesRatingCard value={resolved?.findings} />
        ),
    },
    {
      title: 'Code Smells',
      field: 'resolved.findings.metrics.code_smells',
      align: 'center',
      type: 'numeric',
      width: '5%',
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <CodeSmellsRatingCard value={resolved?.findings} />
        ),
    },
    {
      title: 'Hotspots Reviewed',
      field: 'resolved.findings.metrics.security_hotspots_reviewed',
      align: 'center',
      type: 'numeric',
      width: '5%',
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <HotspotsReviewed value={resolved?.findings} />
        ),
    },
    {
      title: 'Coverage',
      field: 'resolved.findings.metrics.coverage',
      align: 'center',
      type: 'numeric',
      width: '10%',
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <CoverageRatingCard value={resolved?.findings} />
        ),
    },
    {
      title: 'Duplications',
      field: 'resolved.findings.metrics.duplicated_lines_density',
      type: 'numeric',
      width: '10%',
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <DuplicationsRatingCard value={resolved?.findings} />
        ),
    },
  ];
};

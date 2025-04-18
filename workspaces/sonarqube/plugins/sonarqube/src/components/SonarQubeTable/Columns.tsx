/*
 * Copyright 2024 The Backstage Authors
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
import { Link, TableColumn } from '@backstage/core-components';
import {
  EntityPeekAheadPopover,
  EntityRefLink,
} from '@backstage/plugin-catalog-react';
import IconButton from '@material-ui/core/IconButton';
import LinkIcon from '@material-ui/icons/Link';
import Typography from '@material-ui/core/Typography';
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
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { sonarqubeTranslationRef } from '../../translation';

const EntityLink = ({
  entityRef,
  title,
  url,
  kind,
  namespace,
}: EntityLinkProps) => {
  return (
    <Typography
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
    </Typography>
  );
};

export const getColumns = (
  t: TranslationFunction<typeof sonarqubeTranslationRef.T>,
): TableColumn<SonarQubeTableRow>[] => {
  return [
    {
      title: t('sonarQubeTable.columnsTitle.component'),
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
              title={t('sonarQubeTable.entityLinkTitle')}
              url={scoreCardComponentUrl}
              kind="component"
              namespace="default"
            />
          </>
        );
      },
    },
    {
      title: t('sonarQubeTable.columnsTitle.qualityGate'),
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
      title: t('sonarQubeTable.columnsTitle.bugs'),
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
      title: t('sonarQubeTable.columnsTitle.vulnerabilities'),
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
      title: t('sonarQubeTable.columnsTitle.codeSmells'),
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
      title: t('sonarQubeTable.columnsTitle.hotspotsReviewed'),
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
      title: t('sonarQubeTable.columnsTitle.coverage'),
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
      title: t('sonarQubeTable.columnsTitle.duplications'),
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

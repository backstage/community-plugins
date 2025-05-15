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
import { TableColumn } from '@backstage/core-components';
import {
  EntityPeekAheadPopover,
  EntityRefLink,
} from '@backstage/plugin-catalog-react';
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
import { SonarQubeTableRow } from './types';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { sonarqubeTranslationRef } from '../../translation';

export const getColumns = (
  t: TranslationFunction<typeof sonarqubeTranslationRef.T>,
): TableColumn<SonarQubeTableRow>[] => {
  return [
    {
      title: t('sonarQubeTable.columnsTitle.name'),
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
        const entityRef =
          resolved.entityRef || `component:default/${resolved.name}`;
        return (
          <EntityPeekAheadPopover entityRef={entityRef}>
            <EntityRefLink entityRef={entityRef} />
          </EntityPeekAheadPopover>
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

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

/**
 * Sort function for datetime columns.
 *
 * The dates are sorted from oldest to newest.
 * All undefined values are sorted to the end.
 * @internal
 */
export function datetimeSort<T = SonarQubeTableRow>(
  dataAccessor: (data: T) => string | undefined,
) {
  return (data1: T, data2: T, _type: any) => {
    const a: number = Date.parse(dataAccessor(data1) || '');
    const b: number = Date.parse(dataAccessor(data2) || '');

    if (isNaN(a) && isNaN(b)) {
      return 0; // both NaN
    } else if (isNaN(a)) {
      return 1; // only first NaN
    } else if (isNaN(b)) {
      return -1; // only second NaN
    }
    return a - b;
  };
}

/**
 * Sort function for numeric columns.
 *
 * The numbers are sorted from lowest to highest.
 * All undefined values are sorted to the end.
 * @internal
 */
export function numericSort<T = SonarQubeTableRow>(
  dataAccessor: (data: T) => string | undefined,
) {
  return (data1: T, data2: T, _type: any) => {
    const a: number = Number(dataAccessor(data1));
    const b: number = Number(dataAccessor(data2));

    if (isNaN(a) && isNaN(b)) {
      return 0; // both NaN
    } else if (isNaN(a)) {
      return 1; // only first NaN
    } else if (isNaN(b)) {
      return -1; // only second NaN
    }
    return a - b;
  };
}

export const getColumns = (
  t: TranslationFunction<typeof sonarqubeTranslationRef.T>,
): TableColumn<SonarQubeTableRow>[] => {
  return [
    {
      title: t('sonarQubeTable.columnsTitle.name'),
      field: 'resolved.name',
      type: 'string',
      highlight: true,
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
      field: 'resolved.findings.metrics.alert_status',
      type: 'string',
      render: ({ resolved, id }) => {
        if (resolved?.findings?.metrics) {
          return <QualityBadge value={resolved?.findings} compact />;
        }
        return <NoSonarQubeCard value={resolved} sonarQubeComponentKey={id} />;
      },
    },
    {
      title: t('sonarQubeTable.columnsTitle.lastAnalysis'),
      field: 'resolved.findings.lastAnalysis',
      align: 'right',
      type: 'datetime',
      width: '8%',
      customSort: datetimeSort(data => data.resolved.findings?.lastAnalysis),
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <LastAnalyzedRatingCard value={resolved?.findings} />
        ),
    },
    {
      title: t('sonarQubeTable.columnsTitle.bugs'),
      field: 'resolved.findings.metrics.bugs',
      align: 'center',
      type: 'numeric',
      width: '7%',
      customSort: numericSort(data => data.resolved.findings?.metrics?.bugs),
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <BugReportRatingCard value={resolved?.findings} compact />
        ),
    },
    {
      title: t('sonarQubeTable.columnsTitle.vulnerabilities'),
      field: 'resolved.findings.metrics.vulnerabilities',
      align: 'center',
      width: '7%',
      type: 'numeric',
      customSort: numericSort(
        data => data.resolved.findings?.metrics?.vulnerabilities,
      ),
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <VulnerabilitiesRatingCard value={resolved?.findings} compact />
        ),
    },
    {
      title: t('sonarQubeTable.columnsTitle.codeSmells'),
      field: 'resolved.findings.metrics.code_smells',
      align: 'center',
      type: 'numeric',
      width: '7%',
      customSort: numericSort(
        data => data.resolved.findings?.metrics?.code_smells,
      ),
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <CodeSmellsRatingCard value={resolved?.findings} compact />
        ),
    },
    {
      title: t('sonarQubeTable.columnsTitle.hotspotsReviewed'),
      field: 'resolved.findings.metrics.security_hotspots_reviewed',
      align: 'center',
      type: 'numeric',
      width: '7%',
      customSort: numericSort(
        data => data.resolved.findings?.metrics?.security_hotspots_reviewed,
      ),
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <HotspotsReviewed value={resolved?.findings} compact />
        ),
    },
    {
      title: t('sonarQubeTable.columnsTitle.coverage'),
      field: 'resolved.findings.metrics.coverage',
      align: 'center',
      type: 'numeric',
      width: '7%',
      customSort: numericSort(
        data => data.resolved.findings?.metrics?.coverage,
      ),
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <CoverageRatingCard value={resolved?.findings} compact />
        ),
    },
    {
      title: t('sonarQubeTable.columnsTitle.duplications'),
      field: 'resolved.findings.metrics.duplicated_lines_density',
      align: 'center',
      type: 'numeric',
      width: '7%',
      customSort: numericSort(
        data => data.resolved.findings?.metrics?.duplicated_lines_density,
      ),
      render: ({ resolved }) =>
        resolved?.findings?.metrics && (
          <DuplicationsRatingCard value={resolved?.findings} compact />
        ),
    },
  ];
};

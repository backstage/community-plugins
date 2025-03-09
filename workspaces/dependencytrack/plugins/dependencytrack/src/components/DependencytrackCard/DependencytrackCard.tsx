/*
 * Copyright 2025 The Backstage Authors
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
import { MissingAnnotationEmptyState } from '@backstage/plugin-catalog-react';
import { ErrorApi, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { Options } from '@material-table/core';
import React, { useEffect } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { dependencytrackApiRef } from '../../api';
import { DEPENDENCYTRACK_PROJECT_ID_ANNOTATION, useProjectId } from '../hooks';
import DependencytrackMetricsTable from '../DependencytrackTable/DependencytrackMetricsTable';
import DependencytrackFindingTable from '../DependencytrackTable/DependencytrackFindingsTable';

/**
 * @param entity - the entity to use
 * @param variant - the variant, e.g. 'flex' | 'fullHeight' | 'gridItem';
 * @param tableOptions - tableOptions to use
 * @public
 */
export const DependencytrackSummaryCard = ({
  entity,
  variant = 'gridItem',
  tableOptions,
}: {
  entity: Entity;
  variant?: InfoCardVariants;
  tableOptions: Options<{}>;
}) => {
  const errorApi = useApi<ErrorApi>(errorApiRef);
  const dependencytrackApi = useApi(dependencytrackApiRef);

  const projectId = useProjectId(entity);
  const { loading, value, error } = useAsync(() => {
    return dependencytrackApi.fetchMetrics(entity);
  }, [dependencytrackApi, projectId]);

  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  if (loading || !projectId || error) {
    return (
      <InfoCard title="Dependencytrack Metrics" variant={variant}>
        {loading && <Progress />}

        {!loading && !projectId && (
          <MissingAnnotationEmptyState
            annotation={DEPENDENCYTRACK_PROJECT_ID_ANNOTATION}
          />
        )}

        {!loading && error && (
          <EmptyState
            missing="info"
            title="No information to display"
            description={`There is no Dependencytrack project with id '${projectId}'.`}
          />
        )}
      </InfoCard>
    );
  }

  return (
    <DependencytrackMetricsTable
      projectMetrics={value}
      tableOptions={tableOptions}
    />
  );
};

/**
 * @param entity
 * @param variant
 * @param tableOptions
 * @public
 */
export const DependencytrackFindingCard = ({
  entity,
  variant = 'gridItem',
  tableOptions,
}: {
  entity: Entity;
  variant?: InfoCardVariants;
  tableOptions: Options<{}>;
}) => {
  const errorApi = useApi<ErrorApi>(errorApiRef);
  const dependencytrackApi = useApi(dependencytrackApiRef);

  const projectId = useProjectId(entity);
  const { loading, value, error } = useAsync(
    () => dependencytrackApi.fetchFindings(entity),
    [dependencytrackApi, projectId],
  );

  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  if (loading || !projectId || error) {
    return (
      <InfoCard title="Dependencytrack Findings" variant={variant}>
        {loading && <Progress />}

        {!loading && !projectId && (
          <MissingAnnotationEmptyState
            annotation={DEPENDENCYTRACK_PROJECT_ID_ANNOTATION}
          />
        )}

        {!loading && error && (
          <EmptyState
            missing="info"
            title="No information to display"
            description={`There is no Dependencytrack project with id '${projectId}'.`}
          />
        )}
      </InfoCard>
    );
  }

  return (
    <DependencytrackFindingTable findings={value} tableOptions={tableOptions} />
  );
};

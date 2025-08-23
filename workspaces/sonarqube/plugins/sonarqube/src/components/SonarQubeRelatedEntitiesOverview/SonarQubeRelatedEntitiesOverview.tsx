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
import useAsync from 'react-use/esm/useAsync';
import { useEntity, useRelatedEntities } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  sonarQubeApiRef,
  getProjectInfo,
} from '@backstage-community/plugin-sonarqube-react';
import { SonarQubeTable } from '../index.ts';

/**
 * @public
 */
export type SonarOverviewProps = {
  relationType: string;
  entityKind: string;
};

/**
 * @public
 */
export const SonarQubeRelatedEntitiesOverview = (props: SonarOverviewProps) => {
  const sonarQubeApi = useApi(sonarQubeApiRef);
  const { entity: parentEntity } = useEntity();
  const {
    entities,
    loading: loadingEntities,
    error: errorEntities,
  } = useRelatedEntities(parentEntity, {
    type: props.relationType,
    kind: props.entityKind,
  });

  const findingsRequest: Array<{
    projectInstance: string | undefined;
    componentKey: string;
  }> = [];

  const entityNameToProjectKey: { [key: string]: string } = {};

  for (const entity of entities || []) {
    const { projectKey, projectInstance } = getProjectInfo(entity);
    if (projectKey) {
      entityNameToProjectKey[entity.metadata.name] = projectKey;
      findingsRequest.push({ componentKey: projectKey, projectInstance });
    }
  }
  const {
    value: findingResults,
    loading: loadingFindings,
    error: errorFindings,
  } = useAsync(
    async () => sonarQubeApi.getFindingSummaries(findingsRequest),
    [sonarQubeApi, entities],
  );

  if (loadingEntities || loadingFindings) {
    return <Progress />;
  }
  const error = errorEntities || errorFindings;
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const tableContent: any[] | undefined = entities?.map(entity => {
    const projectKey = entityNameToProjectKey[entity.metadata.name];
    return {
      id: projectKey || entity.metadata.name,
      resolved: {
        entityRef: stringifyEntityRef(entity),
        name: entity.metadata.name,
        findings: findingResults?.get(projectKey),
        isSonarQubeAnnotationEnabled: !!projectKey,
      },
    };
  });

  return <SonarQubeTable tableContent={tableContent} />;
};

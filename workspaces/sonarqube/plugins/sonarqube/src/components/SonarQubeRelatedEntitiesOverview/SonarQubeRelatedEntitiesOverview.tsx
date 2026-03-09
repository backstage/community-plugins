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
import {
  stringifyEntityRef,
  CompoundEntityRef,
} from '@backstage/catalog-model';
import {
  sonarQubeApiRef,
  isSonarQubeAvailable,
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

  const entityRefs: CompoundEntityRef[] = (entities || [])
    .filter(isSonarQubeAvailable)
    .map(e => ({
      kind: e.kind,
      namespace: e.metadata.namespace ?? 'default',
      name: e.metadata.name,
    }));

  const {
    value: findingResults,
    loading: loadingFindings,
    error: errorFindings,
  } = useAsync(
    async () => sonarQubeApi.getFindingSummaries(entityRefs),
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
    const entityRef = stringifyEntityRef(entity);
    return {
      id: entityRef,
      resolved: {
        entityRef: entityRef,
        name: entity.metadata.name,
        findings: findingResults?.get(entityRef),
        isSonarQubeAnnotationEnabled: isSonarQubeAvailable(entity),
      },
    };
  });

  return <SonarQubeTable tableContent={tableContent} />;
};

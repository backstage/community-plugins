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
import {
  EntityInfoCard,
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { ErrorPanel, Progress } from '@backstage/core-components';

import { NpmAnnotation } from '@backstage-community/plugin-npm-common';

import { usePackageInfo } from '../hooks/usePackageInfo';
import { useTranslation } from '../hooks/useTranslation';

import { EntityNpmReleaseOverviewTable } from './EntityNpmReleaseOverviewTable';

/**
 * Card for the catalog (entity page) that shows the latest tags
 * with their version number and the release date.
 *
 * @public
 */
export const EntityNpmReleaseOverviewCard = () => {
  const { entity } = useEntity();
  const { packageInfo, loading, error } = usePackageInfo();
  const { t } = useTranslation();

  const packageName = entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];

  return (
    <EntityInfoCard title={t('releaseOverviewCard.title')}>
      {!packageName ? (
        <MissingAnnotationEmptyState
          annotation={NpmAnnotation.PACKAGE_NAME}
          readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format"
        />
      ) : null}
      {packageName && loading ? <Progress /> : null}
      {packageName && error ? <ErrorPanel error={error} /> : null}
      {packageInfo ? (
        <EntityNpmReleaseOverviewTable
          entity={entity}
          packageInfo={packageInfo}
          isPending={loading}
          isStale={loading}
          error={error}
        />
      ) : null}
    </EntityInfoCard>
  );
};

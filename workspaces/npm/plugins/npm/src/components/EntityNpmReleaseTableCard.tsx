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
import { Flex } from '@backstage/ui';

import { NpmAnnotation } from '@backstage-community/plugin-npm-common';

import { usePackageInfo } from '../hooks/usePackageInfo';
import { useTranslation } from '../hooks/useTranslation';

import { EntityNpmReleaseOverviewTable } from './EntityNpmReleaseOverviewTable';
import { EntityNpmFullVersionTable } from './EntityNpmFullVersionTable';

/**
 * Page content for the catalog (entity page) that shows two tables.
 * One for the latest tags and versions of a npm package.
 * And another one for the complete version history.
 *
 * @public
 */
export const EntityNpmReleaseTableCard = () => {
  const { entity } = useEntity();
  const { packageInfo, loading, error } = usePackageInfo();
  const { t } = useTranslation();

  const packageName = entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];

  // TODO: export both tables as cards and rename `EntityNpmReleaseTableCard` to `EntityNpmReleaseContent` or `NpmReleaseEntityContent`
  return (
    <Flex direction="column" gap="4">
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

      <EntityInfoCard title={t('versionHistoryCard.title')}>
        {!packageName ? (
          <MissingAnnotationEmptyState
            annotation={NpmAnnotation.PACKAGE_NAME}
            readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format"
          />
        ) : null}
        {packageName && loading ? <Progress /> : null}
        {packageName && error ? <ErrorPanel error={error} /> : null}
        {packageInfo ? (
          <EntityNpmFullVersionTable
            packageInfo={packageInfo}
            isPending={loading}
            isStale={loading}
            error={error}
          />
        ) : null}
      </EntityInfoCard>
    </Flex>
  );
};

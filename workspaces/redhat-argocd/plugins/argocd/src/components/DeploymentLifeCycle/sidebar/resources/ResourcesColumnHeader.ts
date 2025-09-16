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
import { TranslationFunction } from 'backstage/core-plugin-api/alpha';
import { argocdTranslationRef } from '../../../../translations/ref';

export const getResourcesColumnHeaders = (
  t: TranslationFunction<typeof argocdTranslationRef.T>,
): TableColumn[] => {
  return [
    {
      id: 'expander',
      title: '',
    },
    {
      id: 'name',
      title: t('deploymentLifeCycle.sideBar.resource.columnHeader.name'),
    },
    {
      id: 'kind',
      title: t('deploymentLifeCycle.sideBar.resource.columnHeader.kind'),
    },
    {
      id: 'created-at',
      title: t('deploymentLifeCycle.sideBar.resource.columnHeader.createdAt'),
    },
    {
      id: 'sync-status',
      title: t('deploymentLifeCycle.sideBar.resource.columnHeader.syncStatus'),
    },
    {
      id: 'health-status',
      title: t(
        'deploymentLifeCycle.sideBar.resource.columnHeader.healthStatus',
      ),
    },
  ];
};

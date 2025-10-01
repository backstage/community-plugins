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
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

export const getPipelineRunColumnHeader = (
  t: TranslationFunction<typeof tektonTranslationRef.T>,
): TableColumn[] => {
  return [
    {
      id: 'expander',
    },
    {
      id: 'name',
      title: t('pipelineRunList.tableHeaderTitle.name'),
      field: 'metadata.name',
    },
    {
      id: 'vulnerabilities',
      title: t('pipelineRunList.tableHeaderTitle.vulnerabilities'),
      field: 'status.results',
    },
    {
      id: 'status',
      title: t('pipelineRunList.tableHeaderTitle.status'),
      field: 'status.conditions[0].reason',
    },
    {
      id: 'task-status',
      title: t('pipelineRunList.tableHeaderTitle.taskStatus'),
      field: 'status.conditions[0].reason',
    },
    {
      id: 'start-time',
      title: t('pipelineRunList.tableHeaderTitle.startTime'),
      field: 'status.startTime',
      defaultSort: 'desc',
    },
    {
      id: 'duration',
      title: t('pipelineRunList.tableHeaderTitle.duration'),
      field: 'status.completionTime',
    },
    {
      id: 'actions',
      title: t('pipelineRunList.tableHeaderTitle.actions'),
    },
  ];
};

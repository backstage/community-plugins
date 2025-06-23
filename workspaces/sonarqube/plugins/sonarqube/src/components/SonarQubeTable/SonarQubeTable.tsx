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
import { ReactNode } from 'react';
import { ErrorPanel, Table } from '@backstage/core-components';
import { getColumns } from './Columns';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { sonarqubeTranslationRef } from '../../translation';

/**
 * @public
 */
export type SonarQubeTableProps = {
  tableContent: any[] | undefined;
  title?: string;
  options?: any | undefined;
  emptyContent?: ReactNode;
  localization?: any;
};
/**
 * @public
 */
export const SonarQubeTable = ({
  tableContent,
  title,
  options,
  emptyContent,
  localization,
}: SonarQubeTableProps) => {
  const { t } = useTranslationRef(sonarqubeTranslationRef);
  if (!tableContent) {
    return <ErrorPanel error={Error('Table could not be rendered')} />;
  }
  const pageSize = options?.pageSize || 20;
  const showPagination = tableContent?.length > pageSize;
  return (
    <Table
      title={
        <div>{`${title ?? t('sonarQubeCard.title')} (${
          tableContent.length
        })`}</div>
      }
      options={{
        padding: 'dense',
        paging: showPagination,
        pageSize: pageSize,
        pageSizeOptions: [10, 20, 50, 100],
        ...options,
      }}
      data={tableContent || []}
      columns={getColumns(t)}
      emptyContent={emptyContent}
      localization={localization}
    />
  );
};

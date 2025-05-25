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
import Box from '@material-ui/core/Box';
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
  return (
    <Box
      sx={{
        overflow: 'auto',
      }}
    >
      <div>
        <Table
          title={<div>{`(${tableContent.length}) ${title}`}</div>}
          options={options}
          data={tableContent || []}
          columns={getColumns(t)}
          emptyContent={emptyContent}
          localization={localization}
        />
      </div>
    </Box>
  );
};

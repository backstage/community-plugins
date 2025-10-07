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

import { useEntity } from '@backstage/plugin-catalog-react';
import { getAppCodeFromEntity } from '../../utils/getAppCodeFromEntity';
import { useInfraDetails } from '../../hooks/useInfraDetails';
import { Progress, Table, TableColumn } from '@backstage/core-components';
import { Paper, TableContainer } from '@material-ui/core';
import { InfraDetails } from '../../../../api/cmdb/types';

export const InfraDetailsComponent = () => {
  const { entity } = useEntity();
  const appCode = getAppCodeFromEntity(entity);
  const { loading, infraDetails } = useInfraDetails(appCode);

  if (loading) return <Progress />;

  const columns: TableColumn<InfraDetails>[] = [
    {
      title: 'Cluster',
      field: 'child.name',
      defaultGroupOrder: 0,
    },
    {
      title: 'Name',
      field: 'parent.name',
    },
    {
      title: 'Class',
      field: 'parent.sys_class_name',
    },
    {
      title: 'Updated on',
      field: 'sys_updated_on',
    },
  ];

  return (
    <TableContainer component={Paper}>
      <Table
        options={{
          searchFieldVariant: 'outlined',
          pageSize: 10,
          emptyRowsWhenPaging: false,
          grouping: false,
          draggable: false,
        }}
        title="Infrastructure Details"
        data={infraDetails}
        columns={columns}
      />
    </TableContainer>
  );
};

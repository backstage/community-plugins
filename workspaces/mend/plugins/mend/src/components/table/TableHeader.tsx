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
import { Statistics } from '../../models';
import { Total } from '../Total';
import { TableToolbar } from './TableToolbar';

type TableHeaderProps = {
  clientName: string;
  data: Statistics;
  dataLoading: boolean;
  headerTitle?: string;
  toolbar: any; // Allow any object structure here
  ProjectFilterComponent: React.FC;
  totalTitle: string;
  url: string;
};

export const TableHeader = ({
  clientName,
  data,
  dataLoading,
  headerTitle,
  toolbar,
  ProjectFilterComponent,
  totalTitle,
  url,
}: TableHeaderProps) => {
  return (
    <TableToolbar
      toolbar={toolbar}
      title={headerTitle}
      ProjectFilterComponent={ProjectFilterComponent}
    >
      <Total
        clientName={clientName}
        data={data}
        dataLoading={dataLoading}
        title={totalTitle}
        url={url}
      />
    </TableToolbar>
  );
};

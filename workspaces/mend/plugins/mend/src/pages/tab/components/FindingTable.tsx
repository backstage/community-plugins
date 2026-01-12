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
import { Finding, Project } from '../../../models';
import { Table } from '../../../components';
import { FindingData } from '../../../queries';
import { findingTableColumnSchema } from './findingTable.schema';
import { getFindingStatistics } from './findingTable.helpers';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const FindingTable = ({
  findingData,
  findingDataError,
  findingDataLoading,
}: FindingData) => {
  // Read the query parameters for filter the project on the Mend Tab
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const selectedProject = queryParams.get('filter') || null;

  const [clientName, setClientName] = useState<string>('');
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const resolvedClientName =
      findingData?.clientName || findingDataError?.response?.clientName || '';
    const resolvedClientUrl =
      findingData?.clientUrl || findingDataError?.response?.clientUrl || '';

    setClientName(resolvedClientName);

    if (resolvedClientUrl && resolvedClientName) {
      let constructedUrl = `${resolvedClientUrl}/app/orgs/${resolvedClientName}/projects`;
      if (findingData?.projectSourceUrl) {
        constructedUrl = `${constructedUrl}?filter_prj_sum_tbl_tags=contains:${findingData?.projectSourceUrl}`;
      }
      setUrl(constructedUrl);
    }
  }, [findingData, findingDataError]);

  return (
    <Table
      clientName={clientName}
      clientUrl={url}
      getStatistics={data => getFindingStatistics(data as Finding[])}
      headerTitle="Mend.io"
      tableColumns={findingTableColumnSchema}
      tableData={findingData?.findingList as Finding[]}
      tableDataError={findingDataError}
      tableDataLoading={findingDataLoading}
      tableTitle="Project Findings"
      totalTitle="Findings Overview"
      projectList={findingData?.projectList as Project[]}
      selectedProject={selectedProject}
    />
  );
};

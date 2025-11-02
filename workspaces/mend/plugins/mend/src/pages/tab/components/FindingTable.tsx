import { Finding, Project } from '../../../models';
import { Table } from '../../../components';
import { FindingData } from '../../../queries';
import { findingTableColumnSchema } from './findingTable.schema';
import { getFindingStatistics } from './findingTable.helpers';
import { useLocation } from 'react-router-dom';

export const FindingTable = ({
  findingData,
  findingDataError,
  findingDataLoading,
}: FindingData) => {
  // Read the query parameters for filter the project on the Mend Tab
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const selectedProject = queryParams.get('filter') || null;

  return (
    <Table
      clientName={findingData?.clientName}
      clientUrl={`${findingData?.clientUrl}/app/orgs/${findingData?.clientName}/projects?filter_prj_sum_tbl_tags=contains:${findingData?.projectSourceUrl}`}
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

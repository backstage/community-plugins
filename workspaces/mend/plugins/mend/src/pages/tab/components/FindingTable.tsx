import { Finding } from '../../../models';
import { Table } from '../../../components';
import { FindingData } from '../../../queries';
import { findingTableColumnSchema } from './findingTable.schema';
import { getFindingStatistics } from './findingTable.helpers';

export const FindingTable = ({
  findingData,
  findingDataError,
  findingDataLoading,
}: FindingData) => (
  <Table
    clientName={findingData?.clientName}
    clientUrl={`${
      !!findingData?.projectUuid
        ? `${findingData?.clientUrl}/app/orgs/${findingData.clientName}/applications/summary?project=${findingData?.projectUuid}`
        : findingData?.clientUrl
    }`}
    getStatistics={data => getFindingStatistics(data as Finding[])}
    headerTitle="mend.io"
    tableColumns={findingTableColumnSchema}
    tableData={findingData?.findingList as Finding[]}
    tableDataError={findingDataError}
    tableDataLoading={findingDataLoading}
    tableTitle="Project Findings"
    totalTitle="Findings Overview"
  />
);

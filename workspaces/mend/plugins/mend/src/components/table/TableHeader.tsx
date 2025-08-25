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

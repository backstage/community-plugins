import type { ReactElement, ReactNode, Ref } from 'react';
import { useRef, forwardRef } from 'react';
import { Table as TableBackstage } from '@backstage/core-components';
import { makeStyles, SvgIcon } from '@material-ui/core';
import { Project, Finding, Statistics } from '../../models';
import { TableMessage } from './TableMessage';
import { TableHeader } from './TableHeader';
import { TablePagination } from './TablePagination';
import { tableBackstageIcons, TableIcon } from './table.icons';
import { TableBar } from './TableBar';
import { TablePaper } from './TablePaper';

type MaterialTable = {
  dataManager?: {
    sortedData: Project[] & Finding[];
    searchText: string;
  };
};

export type TableRowProjectProps = Project & {
  tableData?: {
    id: number;
    uuid: string;
  };
};

export type TableRowFindingProps = Finding & {
  tableData?: {
    id: number;
    uuid: string;
  };
};

export type TableColumnProps<T> = {
  title: ReactElement;
  field: string;
  width: string;
  headerStyle: any;
  cellStyle: any;
  render: (row: T) => ReactNode;
};

const useStyles = makeStyles(theme => ({
  funnelIcon: {
    color: theme.palette.type === 'light' ? '#232F3E' : 'white',
  },
}));

type TableProps = {
  clientName?: string;
  clientUrl: string;
  getStatistics: (data?: (Project | Finding)[]) => Statistics;
  headerTitle?: string;
  tableColumns?: TableColumnProps<
    TableRowProjectProps & TableRowFindingProps
  >[];
  tableData: (Project | Finding)[];
  tableDataError: Error | null;
  tableDataLoading: boolean;
  tableTitle: string;
  totalTitle: string;
};

export const Table = ({
  clientName = '',
  clientUrl = '',
  getStatistics,
  headerTitle,
  tableColumns = [],
  tableData = [],
  tableDataError,
  tableDataLoading,
  tableTitle,
  totalTitle,
}: TableProps) => {
  const classes = useStyles();
  const tableRef = useRef<MaterialTable>(null);
  return (
    <TableBackstage
      localization={{
        body: {
          emptyDataSourceMessage: tableDataError ? (
            <TableMessage
              icon={TableIcon.ERROR}
              title="Oops! Something Went Wrong"
              message="An unexpected error occurred when loading this table. Please try
        refreshing the page."
            />
          ) : (
            <TableMessage
              icon={TableIcon.EMPTY}
              title="No Results Found"
              message="No results were found for your filter. Please check your spelling and
        try again."
            />
          ),
        },
      }}
      tableRef={tableRef}
      options={{
        showEmptyDataSourceMessage: true,
        search: true,
        paging: true,
        toolbar: true,
        grouping: true, // NOTE: require to display groupbar component
        pageSize: 50,
        pageSizeOptions: [50, 100, 200],
        emptyRowsWhenPaging: false,
        rowStyle: {
          borderTop: '1px solid #DFDFDF',
          borderBottom: '1px solid #DFDFDF',
        },
      }}
      isLoading={tableDataLoading}
      columns={tableColumns}
      data={tableData as (Project & Finding)[]} // Accept both types
      icons={{
        ...tableBackstageIcons,
        Search: forwardRef((_, ref: Ref<SVGSVGElement>) => (
          <SvgIcon
            ref={ref}
            width="16"
            height="14"
            viewBox="-2 0 23 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={classes.funnelIcon}
          >
            <path d="M0 1.23438C0 0.553125 0.553125 0 1.23438 0H14.7656C15.4469 0 16 0.553125 16 1.23438C16 1.52188 15.9 1.8 15.7156 2.02187L10 8.93125V12.9406C10 13.525 9.525 14 8.94063 14C8.70625 14 8.47812 13.9219 8.29062 13.7781L6.38438 12.2969C6.14062 12.1062 5.99687 11.8156 5.99687 11.5063V8.93125L0.284375 2.02187C0.1 1.8 0 1.52188 0 1.23438ZM1.23438 1C1.10312 1 1 1.10625 1 1.23438C1 1.29062 1.01875 1.34063 1.05313 1.38438L6.88438 8.43125C6.95937 8.52187 7 8.63437 7 8.75V11.5063L8.90625 12.9875C8.91562 12.9969 8.92813 13 8.94063 13C8.97188 13 9 12.975 9 12.9406V8.75C9 8.63437 9.04063 8.52187 9.11563 8.43125L14.9469 1.38438C14.9812 1.34375 15 1.29062 15 1.23438C15 1.10312 14.8938 1 14.7656 1H1.23438Z" />
          </SvgIcon>
        )),
      }}
      components={{
        // NOTE: This component only wrap table into paper component
        Container: props => <TablePaper {...props} />,
        // NOTE: This component act as table toolbar.
        Groupbar: () => (
          <TableBar
            active={tableRef.current?.dataManager?.sortedData?.length}
            title={tableTitle}
            total={
              !!tableRef.current?.dataManager?.searchText &&
              tableRef.current?.dataManager?.sortedData?.length <
                tableData.length &&
              tableData.length
            }
          />
        ),
        // NOTE: This component contain search/filter input and total statistics rendered at the top of page.
        Toolbar: props => {
          return (
            <TableHeader
              clientName={clientName}
              data={getStatistics(tableRef.current?.dataManager?.sortedData)}
              dataLoading={tableDataLoading}
              headerTitle={headerTitle}
              toolbar={props}
              totalTitle={totalTitle}
              url={clientUrl}
            />
          );
        },
        Pagination: props => <TablePagination {...props} />,
      }}
    />
  );
};

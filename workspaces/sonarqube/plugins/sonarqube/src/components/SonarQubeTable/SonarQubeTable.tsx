import React from 'react';
import Box from '@material-ui/core/Box';
import { ErrorPanel, Table } from '@backstage/core-components';
import { getColumns } from './Columns';

/**
 * @public
 */
export type SonarQubeTableProps = {
  tableContent: any[] | undefined;
  title?: string;
  options?: any | undefined;
  emptyContent?: React.ReactNode;
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
          columns={getColumns()}
          emptyContent={emptyContent}
          localization={localization}
        />
      </div>
    </Box>
  );
};

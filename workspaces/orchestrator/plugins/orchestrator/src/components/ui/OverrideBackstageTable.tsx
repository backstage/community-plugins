import React from 'react';

import {
  Table as BackstageTable,
  TableProps,
} from '@backstage/core-components';

import { styled } from '@mui/material/styles';

// Workaround by issue created from overriding the tab theme in the backstage-showcase to add a gray background to disabled tabs.
// This is achieved by overriding the global Mui-disabled class, which results in the actions column header background turning gray.
// See https://github.com/janus-idp/backstage-showcase/blob/main/packages/app/src/themes/componentOverrides.ts#L59

const TableDiv = styled('div')({
  '& .Mui-disabled': {
    backgroundColor: 'transparent',
  },
});

const OverrideBackstageTable = <T extends object>(props: TableProps<T>) => {
  return (
    <TableDiv>
      <BackstageTable
        {...props}
        options={{ ...props.options, thirdSortClick: false }}
      />
    </TableDiv>
  );
};

export default OverrideBackstageTable;

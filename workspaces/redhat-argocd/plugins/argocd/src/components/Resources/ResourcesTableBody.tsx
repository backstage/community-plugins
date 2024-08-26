import React, { useState } from 'react';
import { ResourcesTableRow } from './ResourcesTableRow';
import { OpenRowStatus, Resource } from '../../types';

type ResourcesTableBodyProps = {
  rows: any;
  createdAt: string;
};

export const ResourcesTableBody = ({
  rows,
  createdAt,
}: ResourcesTableBodyProps) => {
  const [open, setOpen] = useState<OpenRowStatus>({});

  return (
    <>
      {rows.map((row: Resource, index: number) => {
        return (
          <ResourcesTableRow
            row={row}
            createdAt={createdAt}
            key={index}
            uid={index.toString()}
            open={open[index] ? true : false}
            setOpen={setOpen}
          />
        );
      })}
    </>
  );
};

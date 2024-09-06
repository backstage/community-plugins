import React, { useState } from 'react';
import { ResourcesTableRow } from './ResourcesTableRow';
import { OpenRowStatus, Resource } from '../../../../types/application';

interface ResourcesTableBodyProps {
  rows: Resource[];
  createdAt: string;
}

export const ResourcesTableBody: React.FC<ResourcesTableBodyProps> = ({
  rows,
  createdAt,
}) => {
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

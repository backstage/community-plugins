import React from 'react';
import { ResourcesTableRow } from './ResourcesTableRow';
import { Resource } from '../../../../types/application';

interface ResourcesTableBodyProps {
  rows: Resource[];
  createdAt: string;
}

export const ResourcesTableBody: React.FC<ResourcesTableBodyProps> = ({
  rows,
  createdAt,
}) => {
  return (
    <>
      {rows.map((row: Resource, index: number) => {
        return (
          <ResourcesTableRow
            row={row}
            createdAt={createdAt}
            key={index}
            uid={index.toString()}
          />
        );
      })}
    </>
  );
};

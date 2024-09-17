import React from 'react';
import { ResourcesTableRow } from './ResourcesTableRow';
import { Resource } from '../../../../types/application';

interface ResourcesTableBodyProps {
  rows: Resource[];
}

export const ResourcesTableBody: React.FC<ResourcesTableBodyProps> = ({
  rows,
}) => {
  return (
    <>
      {rows.map((row: Resource, index: number) => {
        return (
          <ResourcesTableRow row={row} key={index} uid={index.toString()} />
        );
      })}
    </>
  );
};

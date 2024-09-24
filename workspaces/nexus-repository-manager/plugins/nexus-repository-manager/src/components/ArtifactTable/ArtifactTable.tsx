import React from 'react';

import { Link, Table, type TableColumn } from '@backstage/core-components';

import { Box, Chip, makeStyles } from '@material-ui/core';

import { formatByteSize } from '@janus-idp/shared-react';

import type { AssetHash } from '../../types';

export type ArtifactRowData = {
  id?: string;
  version?: string;
  artifact?: string;
  assetVariants: Set<string>;
  repositoryType?: string;
  hash?: AssetHash;
  lastModified?: string;
  sizeBytes?: number;
};

const useStyles = makeStyles(theme => ({
  chip: {
    margin: 0,
    marginRight: '.2em',
    height: '1.5em',
    '& > span': {
      padding: '.3em',
    },
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const ArtifactTable = ({
  artifacts,
  title,
}: {
  artifacts: ArtifactRowData[];
  title: string;
}) => {
  const classes = useStyles();

  const columns: TableColumn<ArtifactRowData>[] = [
    {
      title: 'Version',
      field: 'version',
      type: 'string',
      highlight: true,
    },
    {
      title: 'Artifact',
      field: 'artifact',
      type: 'string',
      render: rowData => (
        <>
          {rowData.artifact}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '0.2em',
            }}
          >
            {/* sort/reverse for stable order, and so we get `jar +sources` */}
            {[...rowData.assetVariants]
              .sort((a, b) => a.localeCompare(b))
              .reverse()
              .map(variant => {
                return (
                  <Chip
                    label={variant}
                    key={variant}
                    className={classes.chip}
                  />
                );
              })}
          </Box>
        </>
      ),
    },
    {
      title: 'Repository Type',
      field: 'repositoryType',
      type: 'string',
    },
    {
      title: 'Checksum',
      field: 'hash',
      emptyValue: 'N/A',
      render: rowData => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip label={rowData.hash?.algorithm} className={classes.chip} />
          {rowData.hash?.value.slice(0, 12)}
        </Box>
      ),
      customFilterAndSearch: (term, rowData) => {
        if (!rowData.hash) {
          return false;
        }
        return rowData.hash.value.includes(term);
      },
      customSort: (a, b) => {
        if (!a.hash) {
          return -1;
        }
        if (!b.hash) {
          return 1;
        }
        if (a.hash.value === b.hash.value) {
          return 0;
        }
        return a.hash.value < b.hash.value ? -1 : 1;
      },
    },
    {
      title: 'Modified',
      field: 'lastModified',
      type: 'string',
    },
    {
      title: 'Size',
      field: 'sizeBytes',
      render: rowData => formatByteSize(rowData.sizeBytes),
    },
  ];

  return (
    <Table
      title={`Nexus Repository Manager: ${title}`}
      options={{ paging: true, padding: 'dense' }}
      data={artifacts}
      columns={columns}
      emptyContent={
        <div
          className={classes.empty}
          data-testid="nexus-repository-manager-empty-table"
        >
          No data was added yet,&nbsp;
          <Link to="https://github.com/janus-idp/backstage-plugins/blob/main/plugins/nexus-repository-manager/ANNOTATIONS.md">
            learn how to add data
          </Link>
          .
        </div>
      }
    />
  );
};

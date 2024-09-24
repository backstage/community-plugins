import * as React from 'react';

import { TableColumn } from '@backstage/core-components';

import makeStyles from '@material-ui/core/styles/makeStyles';

import { TagRow } from '../../types';
import { ManifestDigestChip } from './ManifestDigestChip';

export const columns: TableColumn[] = [
  {
    title: 'Tag',
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Created',
    field: 'createdTime',
    type: 'date',
  },
  {
    title: 'Last Modified',
    field: 'lastModified',
    type: 'date',
  },
  {
    title: 'Manifest',
    field: 'manifestDigest',
    type: 'string',
    render: (row): React.ReactNode => {
      const hashFunc = (row as TagRow)?.manifestDigest?.substring(0, 6);
      const shortHash = (row as TagRow)?.manifestDigest?.substring(7, 19);
      return <ManifestDigestChip label={hashFunc} hash={shortHash} />;
    },
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

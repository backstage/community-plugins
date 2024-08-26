import { TableColumn } from '@backstage/core-components';

export const ResourcesColumnHeaders: TableColumn[] = [
  {
    id: 'expander',
  },
  {
    id: 'kind',
    title: 'Kind',
  },
  {
    id: 'sync-order',
    title: 'Sync order',
  },
  {
    id: 'created-at',
    title: 'Created at',
  },
  {
    id: 'sync-status',
    title: 'Sync status',
  },
  {
    id: 'health-status',
    title: 'Health status',
  },
  // {
  //   id: 'actions'
  // }
];

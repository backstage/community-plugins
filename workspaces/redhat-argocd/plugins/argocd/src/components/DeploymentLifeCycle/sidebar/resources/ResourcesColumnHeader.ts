import { TableColumn } from '@backstage/core-components';

export const ResourcesColumnHeaders: TableColumn[] = [
  {
    id: 'expander',
    title: '',
  },
  {
    id: 'kind',
    title: 'Kind',
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
];

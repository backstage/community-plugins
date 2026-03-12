/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ActiveVectorStore } from '../../hooks';

export interface StoresTableProps {
  stores: ActiveVectorStore[];
  selectedStoreId: string | null;
  onSelectStore: (id: string) => void;
  onDeleteStore: (store: ActiveVectorStore) => void;
  deleteInProgress: string | null;
  loading?: boolean;
}

export const StoresTable = ({
  stores,
  selectedStoreId,
  onSelectStore,
  onDeleteStore,
  deleteInProgress,
  loading = false,
}: StoresTableProps) => {
  const hasStores = stores.length > 0;

  if (!hasStores) {
    return (
      <Alert severity="info" variant="outlined" sx={{ mb: 1.5 }}>
        No vector stores active. Use the <strong>Create New</strong> tab.
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 1.5 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 600, py: 0.75 } }}>
            <TableCell>Name / ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Files</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right" sx={{ width: 40 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {stores.map(store => (
            <TableRow
              key={store.id}
              selected={store.id === selectedStoreId}
              hover
              onClick={() => onSelectStore(store.id)}
              sx={{
                cursor: 'pointer',
                '&:last-child td': { borderBottom: 0 },
              }}
            >
              <TableCell sx={{ py: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>
                  {store.name !== store.id ? store.name : ''}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontFamily: 'monospace' }}
                >
                  {store.id}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 0.5 }}>
                <Chip
                  icon={
                    store.status === 'completed' ? (
                      <CheckCircleIcon />
                    ) : undefined
                  }
                  label={store.status === 'completed' ? 'Active' : store.status}
                  size="small"
                  color={store.status === 'completed' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="center" sx={{ py: 0.5 }}>
                {store.fileCount}
              </TableCell>
              <TableCell sx={{ py: 0.5 }}>
                {store.createdAt
                  ? new Date(store.createdAt * 1000).toLocaleDateString()
                  : '-'}
              </TableCell>
              <TableCell align="right" sx={{ py: 0.5 }}>
                <Tooltip title="Delete store">
                  <IconButton
                    size="small"
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteStore(store);
                    }}
                    disabled={deleteInProgress === store.id || loading}
                  >
                    {deleteInProgress === store.id ? (
                      <CircularProgress size={14} />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

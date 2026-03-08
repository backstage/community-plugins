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
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Snackbar from '@mui/material/Snackbar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import RefreshIcon from '@mui/icons-material/Refresh';
import { StoresTable } from './StoresTable';
import { IngestDropZone } from './IngestDropZone';
import { DocumentsTable } from './DocumentsTable';
import { DeleteStoreDialog } from './DeleteStoreDialog';
import { useStoreDocuments } from './useStoreDocuments';
import type { ActiveVectorStore } from '../../hooks';

interface Props {
  stores: ActiveVectorStore[];
  selectedStoreId: string | null;
  onSelectStore: (id: string) => void;
  onRefresh: () => void;
  onRemoveStore: (id: string, permanent?: boolean) => Promise<void>;
}

export const KBManageStores = ({
  stores,
  selectedStoreId,
  onSelectStore,
  onRefresh,
  onRemoveStore,
}: Props) => {
  const selectedStore = stores.find(s => s.id === selectedStoreId) ?? null;
  const [removeInProgress, setRemoveInProgress] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    storeId: string;
    storeName: string;
  } | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [ingestResult, setIngestResult] = useState<string | null>(null);

  const {
    documents,
    docsLoading,
    refreshDocs,
    deleteInProgress,
    handleDelete,
  } = useStoreDocuments({
    selectedStoreId,
    onRefresh,
  });

  const confirmDeleteStore = useCallback(async () => {
    if (!deleteConfirm) return;
    const { storeId } = deleteConfirm;
    setDeleteConfirm(null);
    setRemoveInProgress(storeId);
    try {
      await onRemoveStore(storeId, true);
      refreshDocs();
    } finally {
      setRemoveInProgress(null);
    }
  }, [deleteConfirm, onRemoveStore, refreshDocs]);

  const hasStores = stores.length > 0;

  return (
    <>
      <Snackbar
        open={ingestResult !== null}
        autoHideDuration={5000}
        onClose={() => setIngestResult(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setIngestResult(null)}
        >
          {ingestResult}
        </Alert>
      </Snackbar>

      <StoresTable
        stores={stores}
        selectedStoreId={selectedStoreId}
        onSelectStore={id => {
          onSelectStore(id);
          setDetailTab(0);
        }}
        onDeleteStore={store =>
          setDeleteConfirm({
            storeId: store.id,
            storeName: store.name !== store.id ? store.name : store.id,
          })
        }
        deleteInProgress={removeInProgress}
      />

      {selectedStore && (
        <Paper variant="outlined" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              pt: 1,
              pb: 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {selectedStore.name !== selectedStore.id
                ? selectedStore.name
                : selectedStore.id}
            </Typography>
            <Chip
              label={`${documents.length} file${
                documents.length !== 1 ? 's' : ''
              }`}
              size="small"
              variant="outlined"
            />
          </Box>

          <Tabs
            value={detailTab}
            onChange={(_, v) => setDetailTab(v)}
            sx={{
              px: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                textTransform: 'none',
                fontSize: '0.8125rem',
                px: 2,
                mr: 0.5,
              },
            }}
          >
            <Tab
              label="Files"
              icon={<DescriptionIcon />}
              iconPosition="start"
            />
            <Tab
              label="Ingest"
              icon={<CloudUploadIcon />}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 1.5 }}>
            {detailTab === 0 && (
              <>
                {docsLoading ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : documents.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      No documents yet.
                    </Typography>
                    <Button
                      size="small"
                      sx={{ mt: 0.5 }}
                      onClick={() => setDetailTab(1)}
                    >
                      Ingest your first document
                    </Button>
                  </Box>
                ) : (
                  <DocumentsTable
                    documents={documents}
                    deleteInProgress={deleteInProgress}
                    onDelete={handleDelete}
                  />
                )}
              </>
            )}

            {detailTab === 1 && (
              <IngestDropZone
                vectorStoreId={selectedStoreId}
                onUploadComplete={message => {
                  setIngestResult(message);
                  setDetailTab(0);
                  refreshDocs();
                  onRefresh();
                }}
              />
            )}
          </Box>
        </Paper>
      )}

      {hasStores && !selectedStore && (
        <Alert severity="info" variant="outlined" sx={{ mb: 1 }}>
          Select a store above to view or ingest documents.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <DeleteStoreDialog
        deleteConfirm={deleteConfirm}
        onConfirm={confirmDeleteStore}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
};

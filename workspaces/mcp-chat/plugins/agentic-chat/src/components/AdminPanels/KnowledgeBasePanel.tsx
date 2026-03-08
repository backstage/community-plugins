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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { useVectorStores, useVectorStoreConfig } from '../../hooks';
import { KBManageStores } from './KBManageStores';
import { KBCreateStore } from './KBCreateStore';
import { KBRagTest } from './KBRagTest';

type RagTab = 'vector' | 'graph';
type VectorSubTab = 'manage' | 'create' | 'rag';

const TABS_SX = {
  minHeight: 32,
  '& .MuiTab-root': {
    minHeight: 32,
    textTransform: 'none',
    fontSize: '0.8125rem',
    minWidth: 'auto',
    px: 2,
    mr: 0.5,
  },
} as const;

const VectorRagContent = () => {
  const vectorStores = useVectorStores();
  const vsConfig = useVectorStoreConfig();
  const hasStores = vectorStores.stores.length > 0;
  const [subTab, setSubTab] = useState<VectorSubTab>(
    hasStores ? 'manage' : 'create',
  );
  const [createNotice, setCreateNotice] = useState<string | null>(null);

  const handleCreated = useCallback(
    async (id: string, name: string) => {
      setCreateNotice(`"${name}" created (${id})`);
      await vectorStores.refresh();
      vectorStores.setSelectedStoreId(id);
      setSubTab('manage');
    },
    [vectorStores],
  );

  if (vsConfig.loading && vectorStores.loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Loading vector stores...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {vsConfig.error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={vsConfig.clearError}>
          {vsConfig.error}
        </Alert>
      )}
      {vectorStores.error && (
        <Alert
          severity="error"
          sx={{ mb: 1 }}
          onClose={vectorStores.clearError}
        >
          {vectorStores.error}
        </Alert>
      )}

      <Snackbar
        open={vsConfig.saveSuccess}
        autoHideDuration={4000}
        onClose={vsConfig.clearSaveSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={vsConfig.clearSaveSuccess}
        >
          Configuration saved
        </Alert>
      </Snackbar>

      <Snackbar
        open={createNotice !== null}
        autoHideDuration={6000}
        onClose={() => setCreateNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCreateNotice(null)}
        >
          {createNotice}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 1.5,
        }}
      >
        <Tabs
          value={subTab}
          onChange={(_, v) => setSubTab(v as VectorSubTab)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ ...TABS_SX, flexGrow: 1 }}
        >
          <Tab label="Manage Stores" value="manage" />
          <Tab label="Create New" value="create" />
          <Tab label="RAG Testing" value="rag" />
        </Tabs>
        <Chip
          label={`${vectorStores.stores.length} active`}
          size="small"
          color={hasStores ? 'success' : 'warning'}
          sx={{ ml: 1 }}
        />
      </Box>

      {subTab === 'manage' && (
        <KBManageStores
          stores={vectorStores.stores}
          selectedStoreId={vectorStores.selectedStoreId}
          onSelectStore={vectorStores.setSelectedStoreId}
          onRefresh={vectorStores.refresh}
          onRemoveStore={vectorStores.removeStore}
        />
      )}
      {subTab === 'create' && (
        <KBCreateStore vsConfig={vsConfig} onCreated={handleCreated} />
      )}
      {subTab === 'rag' && (
        <KBRagTest
          stores={vectorStores.stores}
          selectedStoreId={vectorStores.selectedStoreId}
        />
      )}
    </>
  );
};

const GraphRagContent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        border: `1px dashed ${alpha(theme.palette.divider, 0.4)}`,
        borderRadius: 2,
        mt: 1,
      }}
    >
      <AccountTreeOutlinedIcon
        sx={{
          fontSize: 48,
          color: alpha(theme.palette.text.secondary, 0.3),
          mb: 2,
        }}
      />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        GraphRAG
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ maxWidth: 480, mx: 'auto' }}
      >
        Graph-based Retrieval Augmented Generation builds a knowledge graph from
        your documents, enabling richer reasoning over entity relationships and
        multi-hop queries. This feature is coming soon.
      </Typography>
    </Box>
  );
};

export const KnowledgeBasePanel = () => {
  const [ragTab, setRagTab] = useState<RagTab>('vector');

  return (
    <Box sx={{ px: 3, py: 1.5, maxWidth: 900, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Tabs
          value={ragTab}
          onChange={(_, v) => setRagTab(v as RagTab)}
          sx={TABS_SX}
        >
          <Tab label="Vector RAG" value="vector" />
          <Tab label="GraphRAG" value="graph" />
        </Tabs>
      </Box>

      {ragTab === 'vector' && <VectorRagContent />}
      {ragTab === 'graph' && <GraphRagContent />}
    </Box>
  );
};

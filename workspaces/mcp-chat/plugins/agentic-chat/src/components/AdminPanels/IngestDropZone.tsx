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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useIngestDropZone } from './useIngestDropZone';

export interface IngestDropZoneProps {
  vectorStoreId: string | null;
  onUploadComplete?: (message: string) => void;
}

export const IngestDropZone = ({
  vectorStoreId,
  onUploadComplete,
}: IngestDropZoneProps) => {
  const {
    onFileUpload,
    uploading,
    error,
    onClearError,
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    fileInputRef,
  } = useIngestDropZone({ vectorStoreId, onUploadComplete });

  return (
    <>
      <Paper
        variant="outlined"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        sx={{
          p: 2,
          textAlign: 'center',
          border: dragOver ? '2px dashed' : '1px dashed',
          borderColor: dragOver ? 'primary.main' : 'divider',
          bgcolor: dragOver ? 'action.hover' : 'transparent',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.light',
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".md,.txt,.pdf,.json,.yaml,.yml"
          multiple
          onChange={e => onFileUpload(e.target.files)}
        />
        <CloudUploadIcon
          sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }}
        />
        <Typography variant="body2">
          Drag & drop files or click to browse
        </Typography>
        <Typography variant="caption" color="textSecondary" component="div">
          .md, .txt, .pdf, .json, .yaml, .yml (max 10 MB)
        </Typography>
        {uploading && (
          <Box
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <CircularProgress size={16} />
            <Typography variant="caption">Ingesting...</Typography>
          </Box>
        )}
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={onClearError}>
          {error}
        </Alert>
      )}
    </>
  );
};

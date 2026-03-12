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
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { DocumentInfo } from '../../types';

export interface DocumentsTableProps {
  documents: DocumentInfo[];
  deleteInProgress: string | null;
  onDelete: (fileId: string) => void;
}

export const DocumentsTable = ({
  documents,
  deleteInProgress,
  onDelete,
}: DocumentsTableProps) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>File Name</TableCell>
          <TableCell>Format</TableCell>
          <TableCell>Size</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {documents.map(doc => (
          <TableRow key={doc.id}>
            <TableCell>
              <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                {doc.fileName}
              </Typography>
            </TableCell>
            <TableCell>{doc.format}</TableCell>
            <TableCell>
              {doc.fileSize > 0
                ? `${(doc.fileSize / 1024).toFixed(1)} KB`
                : '—'}
            </TableCell>
            <TableCell>{doc.status}</TableCell>
            <TableCell align="right">
              {deleteInProgress === doc.id ? (
                <CircularProgress size={20} />
              ) : (
                <Tooltip title="Delete document">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(doc.id)}
                    aria-label={`Delete ${doc.fileName}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

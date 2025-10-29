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
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { IncidentsListColumns } from './IncidentsListColumns';
import { IncidentsTableRow } from './IncidentsTableRow';
import type { IncidentsData } from '../../types';

export const IncidentsTableBody = ({ rows }: { rows: IncidentsData[] }) => {
  // TODO: Add loading and error states

  if (rows?.length > 0) {
    return (
      <TableBody data-testid="incidents">
        {rows.map(row => (
          <IncidentsTableRow key={row.sysId} data={row} />
        ))}
      </TableBody>
    );
  }

  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={IncidentsListColumns.length}>
          <Box
            data-testid="no-incidents-found"
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            No records found
          </Box>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

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
import type { ReactNode } from 'react';
import { MTableToolbar } from '@material-table/core';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

type TableToolbarProps = {
  children: ReactNode;
  ProjectFilterComponent: React.FC;
  title?: string;
  toolbar: any; // Allow any object structure here
};

export const TableToolbar = ({
  toolbar = {},
  ProjectFilterComponent,
  children,
  title,
}: TableToolbarProps) => {
  // Provide default values to avoid defaultProps warning from MTableToolbar
  const toolbarProps = {
    searchFieldStyle: {
      '& .MuiInputAdornment-root': {
        marginRight: 0,
      },
      '& .MuiIconButton-root': {
        padding: '8px',
        '&:hover': {
          transform: 'none',
          backgroundColor: 'transparent',
        },
      },
    },
    searchFieldVariant: 'standard' as const,
    ...toolbar,
  };

  return (
    <Grid container alignItems="center" alignContent="center" gap={1}>
      <Grid xs={12}>
        {title && <Typography variant="h2">{title}</Typography>}
      </Grid>
      <Grid container xs={12} alignItems="center" width="100%">
        <Grid xs={9}>
          <ProjectFilterComponent />
        </Grid>
        <Grid
          xs={3}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginLeft: 'auto',
          }}
        >
          <Box
            sx={{
              '& .MuiInputAdornment-root': {
                marginRight: '0 !important',
              },
              '& .MuiIconButton-root, & button[class*="MuiIconButton-root"]': {
                padding: '8px !important',
                transform: 'none !important',
                '&:hover': {
                  transform: 'none !important',
                  backgroundColor: 'transparent !important',
                },
              },
            }}
          >
            <MTableToolbar {...toolbarProps} />
          </Box>
        </Grid>
      </Grid>
      <Grid xs={12}>{children}</Grid>
    </Grid>
  );
};

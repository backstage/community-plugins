/*
 * Copyright 2024 The Backstage Authors
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
import React, { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { InfoCard } from '@backstage/core-components';

type ChartProps = {
  title: string;
};

const InfoCardStyled = styled(InfoCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  width: '100%',
}));

export const Chart = ({ title, children }: PropsWithChildren<ChartProps>) => {
  return (
    <InfoCardStyled divider={false} noPadding>
      <Box display="flex" alignItems="center">
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
      </Box>
      <Divider />
      {children}
    </InfoCardStyled>
  );
};

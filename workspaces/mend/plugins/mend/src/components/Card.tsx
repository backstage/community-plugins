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
import Container from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

type CardProps = {
  children: ReactNode;
  loading?: boolean;
  title: string;
};

export const Card = ({ children, loading, title }: CardProps): ReactNode => {
  return (
    <Container
      sx={{
        border: '1px solid #dfdfdf',
        height: '100%',
        minHeight: 168,
        width: '100%',
      }}
    >
      <CardHeader
        sx={{
          justifyContent: 'center',
          padding: '16px',
          '& span': {
            fontWeight: 500,
            fontSize: '20px',
          },
        }}
        title={title}
      />
      <Divider />
      <CardContent
        sx={{
          alignItems: 'center',
          justifyContent: 'space-around',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100px',
          padding: '12px !important',
        }}
      >
        {loading ? <CircularProgress /> : children}
      </CardContent>
    </Container>
  );
};

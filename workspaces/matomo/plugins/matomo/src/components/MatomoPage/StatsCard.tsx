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
import { ReactNode } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  subTitle?: ReactNode;
  isLoading?: boolean;
};

export const StatsCard = ({ title, subTitle, isLoading }: Props) => {
  return (
    <Card style={{ height: '300px' }}>
      <CardContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isLoading ? (
          <CircularProgress size={64} />
        ) : (
          <>
            <Typography
              style={{ textAlign: 'center' }}
              variant="h5"
              component="div"
            >
              {title}
            </Typography>
            <Typography
              variant="h1"
              component="div"
              style={{ textAlign: 'center' }}
            >
              {subTitle || 'N/A'}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

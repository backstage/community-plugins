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

import { Grid } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

export const CardSkeleton = () => (
  <Grid container>
    <Grid item xs={12}>
      <Skeleton animation="wave" height={16} />
      <Skeleton animation="wave" height={32} />
    </Grid>
    <Grid item md={6} xs={12}>
      <Skeleton animation="wave" height={16} />
      <Skeleton animation="wave" height={32} />
    </Grid>
    <Grid item md={6} xs={12}>
      <Skeleton animation="wave" height={16} />
      <Skeleton animation="wave" height={32} />
    </Grid>
    <Grid item md={6} xs={12}>
      <Skeleton animation="wave" height={16} />
      <Skeleton animation="wave" height={32} />
    </Grid>
    <Grid item md={6} xs={12}>
      <Skeleton animation="wave" height={16} />
      <Skeleton animation="wave" height={32} />
    </Grid>
    <Grid item xs={12}>
      <Skeleton animation="wave" height={16} />
      <Skeleton animation="wave" height={48} />
    </Grid>
  </Grid>
);

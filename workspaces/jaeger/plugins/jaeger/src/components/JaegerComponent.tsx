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

import React from 'react';
import { Grid } from '@material-ui/core';
import { Content } from '@backstage/core-components';
import { JaegerFetchComponent } from './JaegerFetchComponent';

export const JaegerComponent = () => (
  <Content>
    <Grid container spacing={3} direction="column">
      <Grid item>
        <JaegerFetchComponent />
      </Grid>
    </Grid>
  </Content>
);

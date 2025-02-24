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
import React from 'react';

import Grid from '@mui/material/Grid';

import { TabOrderCard } from './TabOrderCard';
import { KindOrderCard } from './KindOrderCard';

/**
 * A component that renders the default settings. These are the `TabOrderCard`
 * and `KindOrderCard`.
 *
 * @public
 */
export function DefaultSettings() {
  return (
    <Grid container spacing={3} direction="column">
      <Grid item>
        <TabOrderCard />
      </Grid>
      <Grid item>
        <KindOrderCard />
      </Grid>
    </Grid>
  );
}

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
import { Content } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Grid } from '@material-ui/core';
import { baseStyle } from '../../styles/StyleUtils';
import { IstioConfigCard } from '../Overview/IstioConfigCard';
import { ListViewPage } from '../Overview/ListView/ListViewPage';
import { OverviewPage } from '../Overview/OverviewPage';
import { TrafficGraphCard } from '../TrafficGraph/TrafficGraphCard';

export const KialiEntity = () => {
  const { entity } = useEntity();
  return (
    <div className={baseStyle}>
      <Content>
        <Grid container>
          <Grid xs={6}>
            <Grid xs={12}>
              <OverviewPage entity={entity} />
            </Grid>
            <Grid xs={12}>
              <ListViewPage entity={entity} />
            </Grid>
          </Grid>
          <Grid xs={6}>
            <Grid xs={12}>
              <TrafficGraphCard />
            </Grid>
            <Grid xs={12}>
              <IstioConfigCard />
            </Grid>
          </Grid>
        </Grid>
      </Content>
    </div>
  );
};

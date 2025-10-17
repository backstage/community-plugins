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
import {
  DRAWER,
  ENTITY,
  IstioConfigDetails,
} from '@backstage-community/plugin-kiali-common/types';
import { Grid } from '@material-ui/core';
import { IstioConfigDescription } from './IstioConfigDescription';

type IstioConfigInfoProps = {
  istioConfig?: IstioConfigDetails;
  view?: string;
};

export const IstioConfigInfo = (istioConfigProps: IstioConfigInfoProps) => {
  const size =
    istioConfigProps.view === ENTITY || istioConfigProps.view === DRAWER
      ? 12
      : 4;
  return (
    <Grid container spacing={1} style={{ paddingTop: '20px' }}>
      <Grid
        key={`Card_${istioConfigProps.istioConfig?.resource.kind}`}
        item
        xs={size}
      >
        <IstioConfigDescription
          istioConfig={istioConfigProps.istioConfig}
          view={istioConfigProps.view}
        />
      </Grid>
    </Grid>
  );
};

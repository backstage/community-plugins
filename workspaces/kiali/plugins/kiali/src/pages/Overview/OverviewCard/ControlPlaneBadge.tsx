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
import type { ComponentStatus } from '@backstage-community/plugin-kiali-common/types';
import { Chip, makeStyles } from '@material-ui/core';
import { default as React } from 'react';
import { AmbientBadge } from '../../../components/Ambient/AmbientBadge';
import { IstioStatusInline } from '../../../components/IstioStatus/IstioStatusInline';
import { serverConfig } from '../../../config';
import { isRemoteCluster } from './OverviewCardControlPlaneNamespace';
import { RemoteClusterBadge } from './RemoteClusterBadge';

type Props = {
  cluster?: string;
  annotations?: { [key: string]: string };
  status: ComponentStatus[];
};

const useStyles = makeStyles(() => ({
  controlPlane: {
    backgroundColor: '#f3faf2',
    color: '#1e4f18',
    marginLeft: '5px',
  },
}));

export const ControlPlaneBadge = (props: Props): React.JSX.Element => {
  const classes = useStyles();
  return (
    <>
      <Chip
        label="Control plane"
        size="small"
        className={classes.controlPlane}
        color="default"
        variant="outlined"
      />
      {isRemoteCluster(props.annotations) && <RemoteClusterBadge />}
      {serverConfig?.ambientEnabled && (
        <AmbientBadge tooltip="Istio Ambient ztunnel detected in the Control plane" />
      )}{' '}
      <IstioStatusInline {...props} />
    </>
  );
};

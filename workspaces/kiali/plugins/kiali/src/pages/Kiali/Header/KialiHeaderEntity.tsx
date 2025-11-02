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
import { Chip, Grid, Tooltip } from '@material-ui/core';
import { ClusterIcon } from '@patternfly/react-icons';
import { default as React } from 'react';
import { MessageCenter } from '../../../components/MessageCenter/MessageCenter';
import { useServerConfig } from '../../../hooks/useServerConfig';
import { KialiAppState, KialiContext } from '../../../store';
import { HelpKiali } from './HelpKiali';
import { NamespaceSelector } from './NamespaceSelector';

export const KialiHeaderEntity = () => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const { serverConfig } = useServerConfig();

  // Get home cluster from server config
  const homeCluster = React.useMemo(() => {
    if (!serverConfig?.clusters) return null;
    return Object.values(serverConfig.clusters).find(
      cluster => cluster.isKialiHome,
    );
  }, [serverConfig]);

  return (
    <div style={{ marginLeft: '20px' }}>
      <Grid container spacing={0}>
        <Grid item xs={5}>
          {kialiState.namespaces.items &&
            kialiState.namespaces.items?.length > 1 && <NamespaceSelector />}
        </Grid>
        <Grid item xs={6}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'right',
            }}
          >
            <Tooltip
              title={
                <div>
                  Kiali home cluster: {homeCluster?.name || 'Not configured'}
                </div>
              }
            >
              <Chip
                color="primary"
                icon={<ClusterIcon style={{ color: 'white' }} />}
                label={homeCluster?.name || 'Home Cluster'}
                style={{ color: 'white' }}
              />
            </Tooltip>
            <HelpKiali color="black" />
            <MessageCenter color="black" />
          </div>
        </Grid>
        {kialiState.authentication.session && (
          <Grid item xs={1} style={{ marginTop: '5px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <span>
                <b>User : </b>
                {kialiState.authentication.session.username || 'anonymous'}
              </span>
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

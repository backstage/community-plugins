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
import { Header } from '@backstage/core-components';
import { Chip, Tooltip, Typography } from '@material-ui/core';
import { ClusterIcon } from '@patternfly/react-icons';
import { default as React } from 'react';
import { MessageCenter } from '../../../components/MessageCenter/MessageCenter';
import { homeCluster } from '../../../config';
import { KialiAppState, KialiContext } from '../../../store';
import { HelpKiali } from './HelpKiali';
import { NamespaceSelector } from './NamespaceSelector';
import { ProviderSelector } from './ProviderSelector';

export const KialiHeader = () => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  return (
    <Header
      title="Kiali"
      subtitle={
        <>
          <ProviderSelector page />
          <NamespaceSelector page />
        </>
      }
    >
      <Tooltip
        title={<div>Kiali home cluster: {homeCluster?.name}</div>}
        style={{ marginTop: '10px', color: 'white' }}
      >
        <Chip
          variant="outlined"
          icon={<ClusterIcon />}
          label={homeCluster?.name}
          data-test="home-cluster"
          style={{ color: 'white' }}
        />
      </Tooltip>
      <HelpKiali color="white" />
      <MessageCenter />
      {kialiState.authentication.session && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            color: 'white',
          }}
          data-test="user"
        >
          <Typography style={{ margin: '10px' }}>
            <b>User : </b>
            {kialiState.authentication.session.username || 'anonymous'}
          </Typography>
        </div>
      )}
    </Header>
  );
};

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
import { useState } from 'react';

import * as React from 'react';

import { ErrorBoundary } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { kubernetesProxyPermission } from '@backstage/plugin-kubernetes-common';

import { V1Pod } from '@kubernetes/client-node';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { SelectChangeEvent } from '@mui/material/Select';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@patternfly/react-core';

import ResourceName from '../../../common/ResourceName';
import { K8sResourcesContext } from '../../../../hooks/K8sResourcesContext';
import { useTranslation } from '../../../../hooks/useTranslation';
import { ContainerSelector } from './ContainerSelector';
import { PodLogs } from './PodLogs';
import PodLogsDownload from './PodLogsDownload';
import { ContainerScope } from './types';
import { MissingPermissionPage } from '../../permissions/MissingPermissionPage';

type PodLogsDialogProps = {
  podData: V1Pod;
};

type ViewLogsProps = {
  podData: V1Pod;
  onClose?: () => void;
};

const ViewLogs = ({ podData, onClose }: ViewLogsProps) => {
  const { clusters, selectedCluster } = React.useContext(K8sResourcesContext);
  const [logText, setLogText] = useState<string>('');

  const curCluster =
    (clusters.length > 0 && clusters[selectedCluster ?? 0]) || '';
  const { name: podName = '', namespace: podNamespace = '' } =
    podData?.metadata || {};
  const containersList = podData.spec?.containers || [];

  const curContainer =
    (containersList?.length && (containersList?.[0].name ?? '')) || '';

  const [containerSelected, setContainerSelected] =
    React.useState<string>(curContainer);
  const [podScope, setPodScope] = React.useState<ContainerScope>({
    containerName: curContainer,
    podName,
    podNamespace: podNamespace,
    clusterName: curCluster,
  });

  const onContainerChange = (event: SelectChangeEvent) => {
    setContainerSelected(event.target.value);
  };

  React.useEffect(() => {
    if (containerSelected) {
      setPodScope(ps => ({
        ...ps,
        containerName: containerSelected,
      }));
    }
  }, [containerSelected]);

  if (!podName || !podNamespace || !curCluster) {
    return null;
  }
  const stopPolling =
    podData?.status?.phase === 'Succeeded' ||
    podData?.status?.phase === 'Failed' ||
    podData?.status?.phase === 'Running';

  return (
    <Dialog maxWidth="xl" fullWidth open onClose={onClose}>
      <DialogTitle id="dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ResourceName name={podName} kind={podData.kind as string} />
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 1,
              top: 1,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
          <ContainerSelector
            containersList={containersList}
            onContainerChange={onContainerChange}
            containerSelected={containerSelected}
          />
          <PodLogsDownload
            logText={logText}
            fileName={`${podName}-${containerSelected}`}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <RequirePermission
          permission={kubernetesProxyPermission}
          errorPage={
            <Box pb={3}>
              <MissingPermissionPage
                permissions={[kubernetesProxyPermission]}
              />
            </Box>
          }
        >
          <ErrorBoundary>
            <PodLogs
              podScope={podScope}
              setLogText={setLogText}
              stopPolling={stopPolling}
            />
          </ErrorBoundary>
        </RequirePermission>
      </DialogContent>
    </Dialog>
  );
};

export const PodLogsDialog = ({ podData }: PodLogsDialogProps) => {
  const { t } = useTranslation();
  const { clusters, selectedCluster } = React.useContext(K8sResourcesContext);
  const [open, setOpen] = useState<boolean>(false);

  const curCluster =
    (clusters.length > 0 && clusters[selectedCluster ?? 0]) || '';
  const { name: podName = '', namespace: podNamespace = '' } =
    podData?.metadata || {};

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  if (!podName || !podNamespace || !curCluster) {
    return null;
  }

  return (
    <>
      {open && <ViewLogs podData={podData} onClose={closeDialog} />}
      <Button
        style={{ padding: 0 }}
        variant="link"
        aria-label="view logs"
        onClick={openDialog}
      >
        {t('common.viewLogs')}
      </Button>
    </>
  );
};

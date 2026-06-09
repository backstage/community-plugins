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
import { useContext, useEffect, useState } from 'react';

import { ErrorBoundary } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { kubernetesProxyPermission } from '@backstage/plugin-kubernetes-common';
import { Dialog, DialogBody, DialogHeader, Flex } from '@backstage/ui';
import { V1Pod } from '@kubernetes/client-node';
import { Button } from '@patternfly/react-core';

import ResourceName from '../../../common/ResourceName';
import { K8sResourcesContext } from '../../../../hooks/K8sResourcesContext';
import { useTranslation } from '../../../../hooks/useTranslation';
import { ContainerSelector } from './ContainerSelector';
import { PodLogs } from './PodLogs';
import PodLogsDownload from './PodLogsDownload';
import { ContainerScope } from './types';
import { MissingPermissionPage } from '../../permissions/MissingPermissionPage';
import styles from './PodLogsDialog.module.css';

type PodLogsDialogProps = {
  podData: V1Pod;
};

type ViewLogsProps = {
  podData: V1Pod;
  onClose?: () => void;
};

const ViewLogs = ({ podData, onClose }: ViewLogsProps) => {
  const { clusters, selectedCluster } = useContext(K8sResourcesContext);
  const [logText, setLogText] = useState<string>('');

  const curCluster =
    (clusters.length > 0 && clusters[selectedCluster ?? 0]) || '';
  const { name: podName = '', namespace: podNamespace = '' } =
    podData?.metadata || {};
  const containersList = podData.spec?.containers || [];

  const curContainer =
    (containersList?.length && (containersList?.[0].name ?? '')) || '';

  const [containerSelected, setContainerSelected] =
    useState<string>(curContainer);
  const [podScope, setPodScope] = useState<ContainerScope>({
    containerName: curContainer,
    podName,
    podNamespace: podNamespace,
    clusterName: curCluster,
  });

  useEffect(() => {
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
    <Dialog
      isOpen
      isDismissable
      className={styles.dialog}
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
      width="90vw"
      height="85vh"
    >
      <DialogHeader>
        <Flex className={styles.header}>
          <ResourceName name={podName} kind={podData.kind as string} />
          <ContainerSelector
            containersList={containersList}
            onContainerChange={setContainerSelected}
            containerSelected={containerSelected}
          />
          <PodLogsDownload
            logText={logText}
            fileName={`${podName}-${containerSelected}`}
          />
        </Flex>
      </DialogHeader>
      <DialogBody>
        <RequirePermission
          permission={kubernetesProxyPermission}
          errorPage={
            <div className={styles.permissionWrapper}>
              <MissingPermissionPage
                permissions={[kubernetesProxyPermission]}
              />
            </div>
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
      </DialogBody>
    </Dialog>
  );
};

export const PodLogsDialog = ({ podData }: PodLogsDialogProps) => {
  const { t } = useTranslation();
  const { clusters, selectedCluster } = useContext(K8sResourcesContext);
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

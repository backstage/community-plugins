/*
 * Copyright 2021 The Backstage Authors
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
import { ButtonIcon, MenuTrigger, Menu, MenuItem, Text } from '@backstage/ui';
import { RiMore2Line } from '@remixicon/react';
import { useState } from 'react';
import { ilertApiRef } from '../../api';
import { useAlertActions } from '../../hooks/useAlertActions';
import { Alert, AlertAction } from '../../types';
import { AlertAssignModal } from './AlertAssignModal';

import { DEFAULT_NAMESPACE, parseEntityRef } from '@backstage/catalog-model';
import { Link, Progress } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';

export const AlertActionsMenu = ({
  alert,
  onAlertChanged,
  setIsLoading,
}: {
  alert: Alert;
  onAlertChanged?: (alert: Alert) => void;
  setIsLoading?: (isLoading: boolean) => void;
}) => {
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(toastApiRef);
  const identityApi = useApi(identityApiRef);
  const callback = onAlertChanged || ((_: Alert): void => {});
  const setProcessing = setIsLoading || ((_: boolean): void => {});
  const [isAssignAlertModalOpened, setIsAssignAlertModalOpened] =
    useState(false);

  const [{ alertActions, isLoading }] = useAlertActions(alert, true);

  const handleAccept = async (): Promise<void> => {
    try {
      setProcessing(true);

      const { userEntityRef } = await identityApi.getBackstageIdentity();
      const { name: userName } = parseEntityRef(userEntityRef, {
        defaultKind: 'User',
        defaultNamespace: DEFAULT_NAMESPACE,
      });
      const newAlert = await ilertApi.acceptAlert(alert, userName);
      alertApi.post({ title: 'Alert accepted.' });

      callback(newAlert);
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
      alertApi.post({ title: err, status: 'danger' });
    }
  };

  const handleResolve = async (): Promise<void> => {
    try {
      setProcessing(true);
      const { userEntityRef } = await identityApi.getBackstageIdentity();
      const { name: userName } = parseEntityRef(userEntityRef, {
        defaultKind: 'User',
        defaultNamespace: DEFAULT_NAMESPACE,
      });
      const newAlert = await ilertApi.resolveAlert(alert, userName);
      alertApi.post({ title: 'Alert resolved.' });

      callback(newAlert);
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
      alertApi.post({ title: err, status: 'danger' });
    }
  };

  const handleAssign = () => {
    setIsAssignAlertModalOpened(true);
  };

  const handleTriggerAction = (action: AlertAction) => async () => {
    try {
      setProcessing(true);
      await ilertApi.triggerAlertAction(alert, action);
      alertApi.post({ title: 'Alert action triggered.' });
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
      alertApi.post({ title: err, status: 'danger' });
    }
  };

  return (
    <>
      <MenuTrigger>
        <ButtonIcon
          aria-label="more"
          variant="secondary"
          icon={<RiMore2Line size={16} />}
        />
        <Menu>
          {alert.status === 'PENDING' ? (
            <MenuItem key="ack" onAction={handleAccept}>
              <Text>Accept</Text>
            </MenuItem>
          ) : null}

          {alert.status !== 'RESOLVED' ? (
            <MenuItem key="close" onAction={handleResolve}>
              <Text>Resolve</Text>
            </MenuItem>
          ) : null}

          {alert.status !== 'RESOLVED' ? (
            <MenuItem key="assign" onAction={handleAssign}>
              <Text>Assign</Text>
            </MenuItem>
          ) : null}

          {isLoading ? (
            <MenuItem key="loading">
              <Progress style={{ width: '100%' }} />
            </MenuItem>
          ) : (
            alertActions.map(a => {
              const successTrigger = a.history
                ? a.history.find(h => h.success)
                : undefined;
              const triggeredBy =
                successTrigger && successTrigger.actor
                  ? `${successTrigger.actor.firstName} ${successTrigger.actor.lastName}`
                  : '';
              return (
                <MenuItem
                  key={a.webhookId}
                  onAction={handleTriggerAction(a)}
                  isDisabled={!!successTrigger}
                >
                  <Text>
                    {triggeredBy ? `${a.name} (by ${triggeredBy})` : a.name}
                  </Text>
                </MenuItem>
              );
            })
          )}

          <MenuItem key="details">
            <Text>
              <Link to={ilertApi.getAlertDetailsURL(alert)}>View in ilert</Link>
            </Text>
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <AlertAssignModal
        alert={alert}
        setIsModalOpened={setIsAssignAlertModalOpened}
        isModalOpened={isAssignAlertModalOpened}
        onAlertChanged={onAlertChanged}
      />
    </>
  );
};

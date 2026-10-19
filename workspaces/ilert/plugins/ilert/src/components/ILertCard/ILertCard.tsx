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
import { Entity } from '@backstage/catalog-model';
import { ResponseErrorPanel } from '@backstage/core-components';
import { Card, CardHeader, CardBody } from '@backstage/ui';
import { AuthenticationError } from '@backstage/errors';
import { useState } from 'react';
import { ILERT_INTEGRATION_KEY_ANNOTATION } from '../../constants';
import { useILertEntity } from '../../hooks';
import { useAlerts } from '../../hooks/useAlerts';
import { useAlertSource } from '../../hooks/useAlertSource';
import { AlertNewModal } from '../Alert/AlertNewModal';
import { AlertsTable } from '../AlertsPage';
import { MissingAuthorizationHeaderError } from '../Errors';
import { ILertCardActionsHeader } from './ILertCardActionsHeader';
import { ILertCardEmptyState } from './ILertCardEmptyState';
import { ILertCardHeaderStatus } from './ILertCardHeaderStatus';
import { ILertCardMaintenanceModal } from './ILertCardMaintenanceModal';
import { ILertCardOnCall } from './ILertCardOnCall';
import styles from './ILertCard.module.css';

/** @public */
export const isPluginApplicableToEntity = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[ILERT_INTEGRATION_KEY_ANNOTATION]);

/** @public */
export const ILertCard = () => {
  const { integrationKey, name } = useILertEntity();
  const [{ alertSource }, { setAlertSource, refetchAlertSource }] =
    useAlertSource(integrationKey);
  const [
    { tableState, states, alerts, alertsCount, isLoading, error },
    {
      onAlertStatesChange,
      onChangePage,
      onChangeRowsPerPage,
      onAlertChanged,
      refetchAlerts,
      setIsLoading,
    },
  ] = useAlerts(false, true, alertSource);

  const [isNewAlertModalOpened, setIsNewAlertModalOpened] = useState(false);
  const [isMaintenanceModalOpened, setIsMaintenanceModalOpened] =
    useState(false);

  if (error) {
    if (error instanceof AuthenticationError) {
      return <MissingAuthorizationHeaderError />;
    }

    return <ResponseErrorPanel error={error} />;
  }

  if (!integrationKey) {
    return <ILertCardEmptyState />;
  }

  return (
    <>
      <Card data-testid="ilert-card">
        <CardHeader>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div>
              <h2
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                ilert
              </h2>
              <ILertCardActionsHeader
                alertSource={alertSource}
                setAlertSource={setAlertSource}
                setIsNewAlertModalOpened={setIsNewAlertModalOpened}
                setIsMaintenanceModalOpened={setIsMaintenanceModalOpened}
              />
            </div>
            <ILertCardHeaderStatus alertSource={alertSource} />
          </div>
        </CardHeader>
        <CardBody className={styles.content}>
          <ILertCardOnCall alertSource={alertSource} />
          <AlertsTable
            alerts={alerts}
            alertsCount={alertsCount}
            tableState={tableState}
            states={states}
            onAlertChanged={onAlertChanged}
            onAlertStatesChange={onAlertStatesChange}
            onChangePage={onChangePage}
            onChangeRowsPerPage={onChangeRowsPerPage}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            compact
          />
        </CardBody>
      </Card>
      <AlertNewModal
        isModalOpened={isNewAlertModalOpened}
        setIsModalOpened={setIsNewAlertModalOpened}
        refetchAlerts={refetchAlerts}
        initialAlertSource={alertSource}
        entityName={name}
      />
      <ILertCardMaintenanceModal
        alertSource={alertSource}
        refetchAlertSource={refetchAlertSource}
        isModalOpened={isMaintenanceModalOpened}
        setIsModalOpened={setIsMaintenanceModalOpened}
      />
    </>
  );
};

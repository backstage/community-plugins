/*
 * Copyright 2026 The Backstage Authors
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
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Text,
} from '@backstage/ui';
import {
  RiGlobalLine,
  RiAlarmAddLine,
  RiWrenchLine,
  RiPauseLine,
  RiPlayLine,
} from '@remixicon/react';
import { useState } from 'react';
import { ilertApiRef } from '../../api';
import { AlertSource } from '../../types';

import {
  HeaderIconLinkRow,
  IconLinkVerticalProps,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';

export const ILertCardActionsHeader = ({
  alertSource,
  setAlertSource,
  setIsNewAlertModalOpened,
  setIsMaintenanceModalOpened,
}: {
  alertSource: AlertSource | null;
  setAlertSource: (alertSource: AlertSource) => void;
  setIsNewAlertModalOpened: (isOpen: boolean) => void;
  setIsMaintenanceModalOpened: (isOpen: boolean) => void;
}) => {
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(toastApiRef);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisableModalOpened, setIsDisableModalOpened] = useState(false);

  const handleCreateNewAlert = () => {
    setIsNewAlertModalOpened(true);
  };

  const handleEnableAlertSource = async () => {
    try {
      if (!alertSource) {
        return;
      }
      setIsLoading(true);
      const newAlertSource = await ilertApi.enableAlertSource(alertSource);
      alertApi.post({ title: 'Alert source enabled.' });
      setIsLoading(false);
      setAlertSource(newAlertSource);
    } catch (err) {
      setIsLoading(false);
      alertApi.post({ title: err, status: 'danger' });
    }
  };
  const handleDisableAlertSource = async () => {
    try {
      if (!alertSource) {
        return;
      }
      setIsDisableModalOpened(false);
      setIsLoading(true);
      const newAlertSource = await ilertApi.disableAlertSource(alertSource);
      alertApi.post({ title: 'Alert source disabled.' });
      setIsLoading(false);
      setAlertSource(newAlertSource);
    } catch (err) {
      setIsLoading(false);
      alertApi.post({ title: err, status: 'danger' });
    }
  };

  const handleDisableAlertSourceWarningOpen = () => {
    setIsDisableModalOpened(true);
  };

  const handleDisableAlertSourceWarningClose = () => {
    setIsDisableModalOpened(false);
  };

  const handleMaintenanceAlertSource = () => {
    setIsMaintenanceModalOpened(true);
  };

  const alertSourceLink: IconLinkVerticalProps = {
    label: 'Alert Source',
    href: ilertApi.getAlertSourceDetailsURL(alertSource),
    icon: <RiGlobalLine />,
  };

  const createAlertLink: IconLinkVerticalProps = {
    label: 'Create Alert',
    onClick: handleCreateNewAlert,
    icon: <RiAlarmAddLine />,
    color: 'secondary',
    disabled:
      !alertSource ||
      alertSource.status === 'DISABLED' ||
      alertSource.status === 'IN_MAINTENANCE',
  };

  const enableAlertSourceLink: IconLinkVerticalProps = {
    label: 'Enable',
    onClick: handleEnableAlertSource,
    icon: <RiPlayLine />,
    disabled: !alertSource || isLoading,
  };

  const disableAlertSourceLink: IconLinkVerticalProps = {
    label: 'Disable',
    onClick: handleDisableAlertSourceWarningOpen,
    icon: <RiPauseLine />,
    disabled: !alertSource || isLoading,
  };

  const maintenanceAlertSourceLink: IconLinkVerticalProps = {
    label: 'Immediate maintenance',
    onClick: handleMaintenanceAlertSource,
    icon: <RiWrenchLine />,
    disabled: !alertSource || isLoading,
  };

  const links: IconLinkVerticalProps[] = [
    alertSourceLink,
    createAlertLink,
    alertSource && alertSource.active
      ? disableAlertSourceLink
      : enableAlertSourceLink,
  ];

  if (alertSource && alertSource.status !== 'IN_MAINTENANCE') {
    links.push(maintenanceAlertSourceLink);
  }

  return (
    <>
      <HeaderIconLinkRow links={links} />
      <DialogTrigger
        isOpen={isDisableModalOpened}
        onOpenChange={setIsDisableModalOpened}
      >
        <Dialog>
          <DialogHeader>Disable alert source</DialogHeader>
          <DialogBody>
            <div
              style={{
                backgroundColor: 'var(--bui-bg-surface-secondary)',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '16px',
              }}
            >
              <Text>
                Do you really want to disable this alert source? A disabled
                alert source cannot create new alerts.
              </Text>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button onPress={handleDisableAlertSource} variant="primary">
              Disable
            </Button>
            <Button
              onPress={handleDisableAlertSourceWarningClose}
              variant="secondary"
              slot="close"
            >
              Cancel
            </Button>
          </DialogFooter>
        </Dialog>
      </DialogTrigger>
    </>
  );
};

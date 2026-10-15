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
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@backstage/ui';
import { ilertApiRef } from '../../api';
import { AlertSource } from '../../types';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';

export const ILertCardMaintenanceModal = ({
  alertSource,
  refetchAlertSource,
  isModalOpened,
  setIsModalOpened,
}: {
  alertSource: AlertSource | null;
  refetchAlertSource: () => void;
  isModalOpened: boolean;
  setIsModalOpened: (isModalOpened: boolean) => void;
}) => {
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(toastApiRef);
  const [minutes, setMinutes] = useState(5);

  const handleClose = () => {
    setIsModalOpened(false);
  };

  const handleImmediateMaintenance = () => {
    if (!alertSource) {
      return;
    }
    setIsModalOpened(false);
    setTimeout(async () => {
      try {
        await ilertApi.addImmediateMaintenance(alertSource.id, minutes);
        alertApi.post({ title: 'Maintenance started.' });
        refetchAlertSource();
      } catch (err) {
        alertApi.post({ title: err, status: 'danger' });
      }
    }, 250);
  };

  const minuteOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '60 minutes' },
  ];

  if (!alertSource) {
    return null;
  }

  return (
    <DialogTrigger isOpen={isModalOpened} onOpenChange={setIsModalOpened}>
      <Dialog>
        <DialogHeader>New maintenance window</DialogHeader>
        <DialogBody>
          <div style={{ marginBottom: '16px' }}>
            Keep your alert sources quiet, when your systems are under
            maintenance.
          </div>
          <select
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--bui-fg-muted)',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {minuteOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </DialogBody>
        <DialogFooter>
          <Button onPress={handleImmediateMaintenance} variant="primary">
            Create
          </Button>
          <Button onPress={handleClose} variant="secondary" slot="close">
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};

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
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Text,
} from '@backstage/ui';
import { ilertApiRef } from '../../api';
import { useAssignAlert } from '../../hooks/useAssignAlert';
import { Alert } from '../../types';
import styles from './AlertAssignModal.module.css';

export const AlertAssignModal = ({
  alert,
  isModalOpened,
  setIsModalOpened,
  onAlertChanged,
}: {
  alert: Alert | null;
  isModalOpened: boolean;
  setIsModalOpened: (open: boolean) => void;
  onAlertChanged?: (alert: Alert) => void;
}) => {
  const [
    { alertRespondersList, alertResponder, isLoading },
    { setIsLoading, setAlertResponder, setAlertRespondersList },
  ] = useAssignAlert(alert, isModalOpened);
  const callback = onAlertChanged || ((_: Alert): void => {});
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(toastApiRef);

  const handleClose = () => {
    setAlertRespondersList([]);
    setIsModalOpened(false);
  };

  const handleAssign = () => {
    if (!alert || !alertResponder) {
      return;
    }
    setIsLoading(true);
    setAlertRespondersList([]);
    setTimeout(async () => {
      try {
        const newAlert = await ilertApi.assignAlert(alert, alertResponder);
        callback(newAlert);
        alertApi.post({ title: 'Alert assigned.' });
      } catch (err) {
        alertApi.post({ title: err, status: 'danger' });
      }
      setIsLoading(false);
      setIsModalOpened(false);
    }, 250);
  };

  const canAssign = !!alertResponder;

  return (
    <DialogTrigger>
      <Dialog
        isOpen={isModalOpened}
        isDismissable
        onOpenChange={open => {
          if (!open) handleClose();
        }}
      >
        <DialogHeader>Select responder to assign</DialogHeader>
        <DialogBody>
          <div className={styles.alertInfo}>
            <Text>
              This action will assign the alert to the selected responder.
            </Text>
          </div>
          <div className={styles.selectWrapper}>
            <label htmlFor="responder-select" className={styles.label}>
              Responder
            </label>
            <select
              id="responder-select"
              disabled={isLoading}
              value={alertResponder?.id || ''}
              onChange={e => {
                const selected = alertRespondersList.find(
                  r => r.id === parseInt(e.target.value, 10),
                );
                setAlertResponder(selected || null);
              }}
              className={styles.select}
            >
              <option value="">-- Select a responder --</option>
              <optgroup label="Suggested responders">
                {alertRespondersList
                  .filter(r => r.group === 'SUGGESTED')
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Users">
                {alertRespondersList
                  .filter(r => r.group === 'USER')
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Escalation policies">
                {alertRespondersList
                  .filter(r => r.group === 'ESCALATION_POLICY')
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Schedules">
                {alertRespondersList
                  .filter(r => r.group === 'ON_CALL_SCHEDULE')
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            isDisabled={!canAssign}
            onPress={handleAssign}
            variant="primary"
          >
            Assign
          </Button>
          <Button onPress={handleClose} variant="secondary" slot="close">
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};

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

import {
  Button,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';
import { ilertApiRef } from '../../api';
import { useShiftOverride } from '../../hooks/useShiftOverride';
import { Shift } from '../../types';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import styles from './ShiftOverrideModal.module.css';

export const ShiftOverrideModal = ({
  scheduleId,
  shift,
  refetchOnCallSchedules,
  isModalOpened,
  setIsModalOpened,
}: {
  scheduleId: number;
  shift: Shift;
  refetchOnCallSchedules: () => void;
  isModalOpened: boolean;
  setIsModalOpened: (isModalOpened: boolean) => void;
}) => {
  const [
    { isLoading, users, user, start, end },
    { setUser, setStart, setEnd, setIsLoading },
  ] = useShiftOverride(shift, isModalOpened);
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(toastApiRef);

  const handleClose = () => {
    setIsModalOpened(false);
  };

  const handleOverride = () => {
    if (!shift || !shift.user) {
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const success = await ilertApi.overrideShift(
          scheduleId,
          user.id,
          start,
          end,
        );
        if (success) {
          alertApi.post({ title: 'Shift overridden.' });
          refetchOnCallSchedules();
        }
      } catch (err) {
        alertApi.post({ title: err, status: 'danger' });
      }
      setIsModalOpened(false);
    }, 250);
  };

  if (!shift) {
    return null;
  }

  const startDate = start ? new Date(start).toISOString().slice(0, 16) : '';
  const endDate = end ? new Date(end).toISOString().slice(0, 16) : '';

  return (
    <DialogTrigger>
      <Dialog
        isOpen={isModalOpened}
        isDismissable
        onOpenChange={open => {
          if (!open) handleClose();
        }}
      >
        <DialogHeader>Shift override</DialogHeader>
        <DialogBody>
          <div className={styles.formControl}>
            <label htmlFor="user-select" className={styles.label}>
              User
            </label>
            <select
              id="user-select"
              disabled={isLoading}
              value={user?.id || ''}
              onChange={e => {
                const selected = users.find(
                  u => u.id === parseInt(e.target.value, 10),
                );
                if (selected) {
                  setUser(selected);
                }
              }}
              className={styles.select}
            >
              <option value="">-- Select a user --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {ilertApi.getUserInitials(u)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formControl}>
            <label htmlFor="start-datetime" className={styles.label}>
              Start
            </label>
            <input
              id="start-datetime"
              type="datetime-local"
              disabled={isLoading}
              value={startDate}
              onChange={e => {
                const date = e.target.value
                  ? new Date(e.target.value).toISOString()
                  : '';
                setStart(date);
              }}
              className={styles.input}
            />
          </div>
          <div className={styles.formControl}>
            <label htmlFor="end-datetime" className={styles.label}>
              End
            </label>
            <input
              id="end-datetime"
              type="datetime-local"
              disabled={isLoading}
              value={endDate}
              onChange={e => {
                const date = e.target.value
                  ? new Date(e.target.value).toISOString()
                  : '';
                setEnd(date);
              }}
              className={styles.input}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            isDisabled={isLoading}
            onPress={handleOverride}
            variant="primary"
          >
            Override
          </Button>
          <Button
            isDisabled={isLoading}
            onPress={handleClose}
            variant="secondary"
            slot="close"
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};

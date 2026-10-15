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
import { Text } from '@backstage/ui';
import { RiRefreshLine } from '@remixicon/react';
import { DateTime as dt } from 'luxon';
import { useState } from 'react';
import { ilertApiRef } from '../../api';
import { Shift } from '../../types';
import { ShiftOverrideModal } from '../Shift/ShiftOverrideModal';
import styles from './OnCallShiftItem.module.css';

export const OnCallShiftItem = ({
  scheduleId,
  shift,
  refetchOnCallSchedules,
}: {
  scheduleId: number;
  shift: Shift;
  refetchOnCallSchedules: () => void;
}) => {
  const ilertApi = useApi(ilertApiRef);
  const [isModalOpened, setIsModalOpened] = useState(false);

  const handleOverride = () => {
    setIsModalOpened(true);
  };

  if (!shift || !shift.start) {
    return (
      <div className={styles.container}>
        <Text variant="body-small">Nobody</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {shift && shift.user ? (
        <Text variant="body-medium">
          {ilertApi.getUserInitials(shift.user)}
        </Text>
      ) : null}
      <Text variant="body-small">
        {`${dt.fromISO(shift.start).toFormat('D MMM, HH:mm')} - ${dt
          .fromISO(shift.end)
          .toFormat('D MMM, HH:mm')}`}
      </Text>
      <div className={styles.buttonWrapper}>
        {/* eslint-disable-next-line react/forbid-elements */}
        <button className={styles.button} onClick={handleOverride}>
          <RiRefreshLine size={14} style={{ marginRight: 6 }} />
          Override shift
        </button>
      </div>
      <ShiftOverrideModal
        scheduleId={scheduleId}
        shift={shift}
        refetchOnCallSchedules={refetchOnCallSchedules}
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
      />
    </div>
  );
};

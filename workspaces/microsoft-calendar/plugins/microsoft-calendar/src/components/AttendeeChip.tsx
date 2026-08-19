/*
 * Copyright 2022 The Backstage Authors
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

import { RiCloseLine, RiCheckLine } from '@remixicon/react';
import { Attendee, ResponseStatusMap } from '../api';
import styles from './AttendeeChip.module.css';

const ResponseIcon = ({ responseStatus }: { responseStatus: string }) => {
  if (responseStatus === ResponseStatusMap.accepted) {
    return (
      <RiCheckLine
        size={16}
        data-testid="accepted-icon"
        className={styles.acceptedIcon}
      />
    );
  }
  if (responseStatus === ResponseStatusMap.declined) {
    return (
      <RiCloseLine
        size={16}
        data-testid="declined-icon"
        className={styles.declinedIcon}
      />
    );
  }

  return null;
};

type AttendeeChipProps = {
  user: Attendee;
};

export const AttendeeChip = ({ user }: AttendeeChipProps) => {
  const responseStatus = user.status?.response || '';

  return (
    <div className={styles.badge}>
      <div className={styles.chip}>{user.emailAddress?.address}</div>
      {responseStatus && (
        <div className={styles.badgeContent}>
          <ResponseIcon responseStatus={responseStatus} />
        </div>
      )}
    </div>
  );
};

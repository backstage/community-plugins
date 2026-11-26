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

import { Tag, TagGroup } from '@backstage/ui';
import { RiCheckboxCircleFill, RiCloseCircleFill } from '@remixicon/react';
import { EventAttendee, ResponseStatus } from '../../api';
import styles from './AttendeeChip.module.css';

const ResponseIcon = ({ responseStatus }: { responseStatus?: string }) => {
  if (responseStatus === ResponseStatus.accepted) {
    return (
      <span className={`${styles.badge} ${styles.accepted}`}>
        <RiCheckboxCircleFill data-testid="accepted-icon" />
      </span>
    );
  }
  if (responseStatus === ResponseStatus.declined) {
    return (
      <span className={`${styles.badge} ${styles.declined}`}>
        <RiCloseCircleFill data-testid="declined-icon" />
      </span>
    );
  }

  return null;
};

type AttendeeChipProps = {
  user: EventAttendee;
};

export const AttendeeChip = ({ user }: AttendeeChipProps) => {
  return (
    <div className={styles.root}>
      <TagGroup aria-label={`Attendee ${user.email}`}>
        <Tag size="small">{user.email}</Tag>
      </TagGroup>
      <ResponseIcon responseStatus={user.responseStatus} />
    </div>
  );
};

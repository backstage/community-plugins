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
import { Text, ButtonIcon } from '@backstage/ui';
import { RiMailLine, RiPhoneLine } from '@remixicon/react';
import { OnCall } from '../../types';
import { ilertApiRef } from '../../api';
import { DateTime as dt } from 'luxon';
import { useApi } from '@backstage/core-plugin-api';
import styles from './ILertCardOnCallItem.module.css';

export const ILertCardOnCallItem = ({
  onCall,
  fistItem = false,
  lastItem = false,
}: {
  onCall: OnCall;
  fistItem?: boolean;
  lastItem?: boolean;
}) => {
  const ilertApi = useApi(ilertApiRef);

  if (!onCall || !onCall.user) {
    return null;
  }

  const phoneNumber = ilertApi.getUserPhoneNumber(onCall.user);
  const escalationRepeating = onCall.escalationPolicy.repeating;
  const escalationSeconds =
    onCall.escalationPolicy.escalationRules[onCall.escalationLevel - 1]
      .escalationTimeout;
  const escalationHoursOnly = Math.floor(escalationSeconds / 60);
  const escalationMinutesOnly = escalationSeconds % 60;

  let escalationText = '';
  if (!lastItem || (lastItem && escalationRepeating)) {
    escalationText = 'escalate';
    if (escalationSeconds === 0) {
      escalationText += ' immediately';
    } else {
      escalationText += ' after';
      if (escalationHoursOnly > 0) {
        escalationText += ` ${escalationHoursOnly} ${
          escalationHoursOnly === 1 ? 'hour' : 'hours'
        }`;
      }
      if (escalationMinutesOnly > 0 || escalationSeconds === 0) {
        escalationText += ` ${escalationMinutesOnly} ${
          escalationMinutesOnly === 1 ? 'minute' : 'minutes'
        }`;
      }
    }
  }

  let dividerClass = styles.itemLine;
  if (fistItem) {
    dividerClass = styles.fistItemLine;
  } else if (lastItem) {
    dividerClass = styles.lastItemLine;
  }

  return (
    <li className={styles.listItem}>
      <div className={dividerClass} />
      <div
        className={styles.avatarContainer}
        title={`Escalation level #${onCall.escalationLevel}`}
      >
        <div className={styles.avatar}>{onCall.escalationLevel}</div>
      </div>
      <div className={styles.content}>
        {onCall.schedule ? (
          <div
            title={
              'On call shift ' +
              `${dt.fromISO(onCall.start).toFormat('D MMM, HH:mm')} - ` +
              `${dt.fromISO(onCall.end).toFormat('D MMM, HH:mm')}`
            }
          >
            <Text variant="body-medium" className={styles.primary}>
              {ilertApi.getUserInitials(onCall.user)}
            </Text>
            <Text variant="body-small">{escalationText}</Text>
          </div>
        ) : (
          <div>
            <Text variant="body-medium" className={styles.primary}>
              {ilertApi.getUserInitials(onCall.user)}
            </Text>
            <Text variant="body-small">{escalationText}</Text>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {phoneNumber ? (
          <a href={`tel:${phoneNumber}`} title="Call to user">
            <ButtonIcon icon={<RiPhoneLine size={16} />} variant="secondary" />
          </a>
        ) : null}
        <a
          href={`mailto:${onCall.user.email}`}
          title={`Send e-mail to user ${onCall.user.email}`}
        >
          <ButtonIcon icon={<RiMailLine size={16} />} variant="secondary" />
        </a>
      </div>
    </li>
  );
};

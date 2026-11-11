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
import { ACCEPTED, Alert, PENDING, RESOLVED } from '../../types';
import styles from './StatusChip.module.css';

export const alertStatusLabels = {
  [RESOLVED]: 'Resolved',
  [ACCEPTED]: 'Accepted',
  [PENDING]: 'Pending',
} as Record<string, string>;

export const StatusChip = ({ alert }: { alert: Alert }) => {
  const label = `${alertStatusLabels[alert.status]}`;

  switch (alert.status) {
    case RESOLVED:
      return <div className={styles.resolved}>{label}</div>;
    case ACCEPTED:
      return <div className={styles.accepted}>{label}</div>;
    case PENDING:
      return <div className={styles.pending}>{label}</div>;
    default:
      return <div>{label}</div>;
  }
};

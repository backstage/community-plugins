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
  DEGRADED,
  MAJOR_OUTAGE,
  OPERATIONAL,
  PARTIAL_OUTAGE,
  StatusPage,
  UNDER_MAINTENANCE,
} from '../../types';
import styles from './StatusChip.module.css';

const statusPageStatusLabels = {
  [OPERATIONAL]: 'Operational',
  [UNDER_MAINTENANCE]: 'Under maintenance',
  [DEGRADED]: 'Degraded',
  [PARTIAL_OUTAGE]: 'Partial outage',
  [MAJOR_OUTAGE]: 'Major outage',
} as Record<string, string>;

export const StatusChip = ({ statusPage }: { statusPage: StatusPage }) => {
  const label = `${statusPageStatusLabels[statusPage.status]}`;

  switch (statusPage.status) {
    case OPERATIONAL:
      return <div className={styles.operational}>{label}</div>;
    case UNDER_MAINTENANCE:
      return <div className={styles.underMaintenance}>{label}</div>;
    case DEGRADED:
      return <div className={styles.degraded}>{label}</div>;
    case PARTIAL_OUTAGE:
      return <div className={styles.partialOutage}>{label}</div>;
    case MAJOR_OUTAGE:
      return <div className={styles.majorOutage}>{label}</div>;
    default:
      return <div>{label}</div>;
  }
};

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
import { AlertSource } from '../../types';
import styles from './ILertCardHeaderStatus.module.css';

export const ILertCardHeaderStatus = ({
  alertSource,
}: {
  alertSource: AlertSource | null;
}) => {
  if (!alertSource) {
    return null;
  }

  switch (alertSource.status) {
    case 'IN_MAINTENANCE':
      return <div className={styles.maintenance}>MAINTENANCE</div>;
    case 'DISABLED':
      return <div className={styles.maintenance}>INACTIVE</div>;
    default:
      return null;
  }
};

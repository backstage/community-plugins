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
import { ilertApiRef } from '../../api';

import { useApi } from '@backstage/core-plugin-api';
import { Link } from '@backstage/core-components';
import styles from './AlertSourceLink.module.css';

export const AlertSourceLink = ({
  alertSource,
}: {
  alertSource: AlertSource | null;
}) => {
  const ilertApi = useApi(ilertApiRef);
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;

  if (!alertSource) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.imageContainer}>
        <img
          src={prefersDarkMode ? alertSource.lightIconUrl : alertSource.iconUrl}
          alt={alertSource.name}
          className={styles.image}
        />
      </div>
      <div className={styles.linkContainer}>
        <Link
          className={styles.link}
          to={ilertApi.getAlertSourceDetailsURL(alertSource)}
        >
          {alertSource.name}
        </Link>
      </div>
    </div>
  );
};

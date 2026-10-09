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
import { PRIVATE, PUBLIC, StatusPage } from '../../types';
import styles from './VisibilityChip.module.css';

const statusPageVisibilityLabels = {
  [PUBLIC]: 'Public',
  [PRIVATE]: 'Private',
} as Record<string, string>;

export const VisibilityChip = ({ statusPage }: { statusPage: StatusPage }) => {
  const label = `${statusPageVisibilityLabels[statusPage.visibility]}`;

  switch (statusPage.visibility) {
    case PRIVATE:
      return <div className={styles.private}>{label}</div>;
    case PUBLIC:
      return <div className={styles.public}>{label}</div>;
    default:
      return <div>{label}</div>;
  }
};

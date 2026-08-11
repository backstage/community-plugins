/*
 * Copyright 2020 The Backstage Authors
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

import type { EntrySnapshot } from '../../utils/types';
import { Text } from '@backstage/ui';
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiRadioButtonLine,
} from '@remixicon/react';
import { MarkdownContent } from '@backstage/core-components';
import { MovedState } from '@backstage-community/plugin-tech-radar-common';
import styles from './RadarTimeline.module.css';

export type Props = {
  timeline?: EntrySnapshot[];
};

const RadarTimeline = (props: Props): React.JSX.Element => {
  const { timeline } = props;

  return (
    <>
      <Text variant="title-small">History</Text>
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="simple table">
          <thead>
            <tr>
              <th className={styles.th} style={{ wordBreak: 'normal' }}>
                Moved in direction
              </th>
              <th className={styles.th}>Moved to ring</th>
              <th className={styles.th}>Moved on date</th>
              <th className={styles.th}>Description</th>
            </tr>
          </thead>
          <tbody>
            {timeline?.length === 0 && (
              <tr key="no-timeline">
                <td className={styles.td}>No Timeline</td>
              </tr>
            )}
            {timeline?.map(timeEntry => (
              <tr key={timeEntry.description}>
                <td className={styles.td}>
                  {timeEntry.moved === MovedState.Up && (
                    <RiArrowUpLine size={20} />
                  )}
                  {timeEntry.moved === MovedState.Down && (
                    <RiArrowDownLine size={20} />
                  )}
                  {timeEntry.moved === MovedState.NoChange && (
                    <RiRadioButtonLine size={20} />
                  )}
                </td>
                <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>
                  {timeEntry.ring.name ? timeEntry.ring.name : ''}
                </td>
                <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>
                  {timeEntry.date.toLocaleDateString()
                    ? timeEntry.date.toLocaleDateString()
                    : ''}
                </td>
                <td className={styles.td}>
                  {timeEntry.description ? (
                    <MarkdownContent
                      linkTarget="_blank"
                      content={timeEntry.description}
                    />
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export { RadarTimeline };

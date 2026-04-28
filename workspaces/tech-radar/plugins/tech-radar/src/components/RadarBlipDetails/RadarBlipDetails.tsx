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
import { MovedState } from '@backstage-community/plugin-tech-radar-common';
import { Button, Flex, Link } from '@backstage/ui';
import { useComponents } from './../hooks/useComponents';
import { CircleDot, Triangle } from 'lucide-react';
import { DateTime } from 'luxon';

import type { Blip } from '../../types';
import styles from './RadarBlipDetails.module.css';

type Props = Readonly<{
  blip?: Blip;
  onOpenChange?: (open: boolean) => void;
}>;

export const RadarBlipDetails = (props: Props) => {
  const { Dialog, DialogBody, DialogFooter, DialogHeader } = useComponents();

  const { blip, onOpenChange } = props;

  const snapshots = [...(blip?.timeline ?? [])].sort(
    (t1, t2) => t1.date.getTime() - t2.date.getTime(),
  );

  const movedInDirection = (movedState?: MovedState) => {
    const icon = (() => {
      switch (movedState) {
        case MovedState.Down:
          return (
            <Triangle
              className={`${styles.rotate180} ${styles.triangleIcon}`}
              size={12}
            />
          );
        case MovedState.Up:
          return <Triangle className={styles.triangleIcon} size={12} />;
        default:
          return <CircleDot size={16} />;
      }
    })();

    return <Flex align="center">{icon}</Flex>;
  };

  return (
    <Dialog onOpenChange={onOpenChange} isOpen={!!blip} width={900}>
      <DialogHeader>{blip?.title}</DialogHeader>
      <DialogBody className={styles.dialogContent}>
        <table>
          <thead>
            <tr className={styles.tableRow}>
              <th className={styles.tableHeader}>Moved in direction</th>
              <th className={styles.tableHeader}>Moved to ring</th>
              <th className={styles.tableHeader}>Moved on date</th>
              <th className={styles.tableHeader}>Description</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((snapshot, idx) => {
              return (
                <tr className={styles.tableRow} key={idx}>
                  <td>{movedInDirection(snapshot.moved)}</td>
                  <td className={styles.capitalize}>{snapshot.ring.name}</td>
                  <td className={styles.dateCell}>
                    {DateTime.fromJSDate(snapshot.date).toISODate()}
                  </td>
                  <td>{snapshot.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DialogBody>
      <DialogFooter>
        {blip?.url ? (
          <Link className={styles.learnMoreLink} href={blip.url}>
            Learn more
          </Link>
        ) : null}

        <Button variant="secondary" slot="close">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

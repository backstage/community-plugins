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
import { Progress } from '@backstage/core-components';
import { Card, CardBody, CardHeader, Text } from '@backstage/ui';
import { Schedule } from '../../types';
import { OnCallShiftItem } from './OnCallShiftItem';
import styles from './OnCallSchedulesGrid.module.css';

export const OnCallSchedulesGrid = ({
  onCallSchedules,
  isLoading,
  refetchOnCallSchedules,
}: {
  onCallSchedules: Schedule[];
  isLoading: boolean;
  refetchOnCallSchedules: () => void;
}) => {
  if (isLoading) {
    return <Progress />;
  }
  return (
    <div className={styles.grid}>
      {!onCallSchedules?.length
        ? null
        : onCallSchedules.map((schedule, index) => (
            <Card key={index} className={styles.card}>
              <CardHeader className={styles.cardHeader}>
                {schedule.name}
              </CardHeader>
              <CardBody className={styles.cardWrapper}>
                <div className={styles.cardContent}>
                  <div>
                    <Text variant="body-small" className={styles.beforeText}>
                      On call now
                    </Text>
                  </div>
                  <div>
                    <div className={styles.indicatorCurrent} />
                    <OnCallShiftItem
                      shift={schedule.currentShift}
                      scheduleId={schedule.id}
                      refetchOnCallSchedules={refetchOnCallSchedules}
                    />
                  </div>
                </div>
              </CardBody>

              <CardBody>
                <div className={`${styles.cardContent} ${styles.marginBottom}`}>
                  <div>
                    <Text variant="body-small" className={styles.beforeText}>
                      Next on call
                    </Text>
                  </div>

                  <div>
                    <div className={styles.indicatorNext} />
                    <OnCallShiftItem
                      shift={schedule.nextShift}
                      scheduleId={schedule.id}
                      refetchOnCallSchedules={refetchOnCallSchedules}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
    </div>
  );
};

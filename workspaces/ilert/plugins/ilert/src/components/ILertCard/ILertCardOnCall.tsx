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
import { Text } from '@backstage/ui';
import { RiRefreshLine } from '@remixicon/react';
import { AlertSource } from '../../types';
import { useAlertSourceOnCalls } from '../../hooks/useAlertSourceOnCalls';
import { ILertCardOnCallEmptyState } from './ILertCardOnCallEmptyState';
import { ILertCardOnCallItem } from './ILertCardOnCallItem';
import { Progress } from '@backstage/core-components';
import styles from './ILertCardOnCall.module.css';

export const ILertCardOnCall = ({
  alertSource,
}: {
  alertSource: AlertSource | null;
}) => {
  const [{ onCalls, isLoading }, {}] = useAlertSourceOnCalls(alertSource);

  if (isLoading) {
    return <Progress />;
  }

  if (!alertSource || !onCalls) {
    return null;
  }

  const repeatInfo = () => {
    if (
      !alertSource ||
      !alertSource.escalationPolicy ||
      !alertSource.escalationPolicy.repeating ||
      !alertSource.escalationPolicy.frequency
    ) {
      return null;
    }

    return (
      <li key="repeat" className={styles.listItem}>
        <div className={styles.iconContainer}>
          <RiRefreshLine size={16} className={styles.icon} />
        </div>
        <div className={styles.content}>
          <Text variant="body-small" className={styles.repeatText}>
            {`Repeat ${alertSource.escalationPolicy.frequency} times`}
          </Text>
        </div>
      </li>
    );
  };

  if (!onCalls.length) {
    return (
      <div className={styles.root}>
        <h3 className={styles.header}>ON CALL</h3>
        <ILertCardOnCallEmptyState />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h3 className={styles.header}>ON CALL</h3>
      <ul className={styles.list}>
        {onCalls.map((onCall, index) => (
          <ILertCardOnCallItem
            key={index}
            onCall={onCall}
            fistItem={index === 0}
            lastItem={index === onCalls.length - 1}
          />
        ))}
        {repeatInfo()}
      </ul>
    </div>
  );
};

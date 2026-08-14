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
import { useState } from 'react';
import { Text } from '@backstage/ui';
import { ACCEPTED, AlertStatus, PENDING, RESOLVED } from '../../types';
import { alertStatusLabels } from './StatusChip';
import styles from './TableTitle.module.css';

export const TableTitle = ({
  alertStates,
  onAlertStatesChange,
}: {
  alertStates: AlertStatus[];
  onAlertStatesChange: (states: AlertStatus[]) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusToggle = (state: AlertStatus) => {
    if (alertStates.includes(state)) {
      onAlertStatesChange(alertStates.filter(s => s !== state));
    } else {
      onAlertStatesChange([...alertStates, state]);
    }
  };

  const selectedLabels = alertStates
    .map(state => alertStatusLabels[state])
    .join(', ');

  return (
    <div className={styles.root}>
      <Text className={styles.label}>Status:</Text>
      {/* eslint-disable-next-line react/forbid-elements */}
      <div className={styles.selectContainer}>
        {/* eslint-disable-next-line react/forbid-elements */}
        <button
          className={styles.selectField}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* eslint-disable-next-line react/forbid-elements */}
          <span className={styles.selectValue}>
            {selectedLabels || 'Select status...'}
          </span>
          {/* eslint-disable-next-line react/forbid-elements */}
          <span className={styles.selectArrow}>{isExpanded ? '▲' : '▼'}</span>
        </button>
        {isExpanded && (
          <div className={styles.statusOptions}>
            {([PENDING, ACCEPTED, RESOLVED] as AlertStatus[]).map(state => {
              const isSelected = alertStates.includes(state);
              return (
                // eslint-disable-next-line react/forbid-elements
                <button
                  key={state}
                  className={`${styles.statusButton} ${
                    isSelected ? styles.statusButtonActive : ''
                  }`}
                  onClick={() => handleStatusToggle(state)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className={styles.checkbox}
                  />
                  {/* eslint-disable-next-line react/forbid-elements */}
                  <span className={styles.statusLabel}>
                    {alertStatusLabels[state]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

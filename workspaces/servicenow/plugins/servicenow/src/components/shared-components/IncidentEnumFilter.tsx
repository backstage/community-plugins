/*
 * Copyright 2024 The Backstage Authors
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

import React from 'react';
import { SelectItem } from '@backstage/core-components';
import { Box, Checkbox, TextField } from '@backstage/ui';
import { RiArrowDownSLine } from '@remixicon/react';
import { renderStatusLabel, StatusData } from '../../utils/incidentUtils';
import styles from './IncidentEnumFilter.module.css';

export interface IncidentEnumFilterProps {
  label: string;
  /** @deprecated No longer used, kept for backwards compatibility */
  filterKey?: string;
  dataMap: Record<number, StatusData>;
  value: SelectItem[];
  onChange: (event: any, value: SelectItem[]) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const IncidentEnumFilter = ({
  label,
  dataMap,
  value,
  onChange,
  isOpen: externalIsOpen,
  onToggle,
}: IncidentEnumFilterProps) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);

  // Use external isOpen if provided (controlled), otherwise use internal state (uncontrolled)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };
  const items: SelectItem[] = Object.entries(dataMap).map(
    ([key, itemValue]) => ({
      value: key,
      label: itemValue.label,
    }),
  );

  const handleSelect = (item: SelectItem) => {
    const newValue = value.some(v => v.value === item.value)
      ? value.filter(v => v.value !== item.value)
      : [...value, item];
    onChange(null, newValue);
  };

  return (
    <Box className={styles.filterBox}>
      <label className={styles.label}>{label}</label>
      <div className={styles.selectContainer}>
        <button
          className={styles.selectButton}
          onClick={handleToggle}
          aria-label={label}
          type="button"
        >
          <span className={styles.selectValue}>
            {value.length > 0 ? `${value.length} selected` : 'Select...'}
          </span>
          <RiArrowDownSLine
            size={20}
            data-testid={`select-${label.toLowerCase().replace(/\s/g, '-')}`}
          />
        </button>
        {isOpen && (
          <div className={styles.dropdown}>
            {items.map(item => (
              <label key={item.value} className={styles.option}>
                <Checkbox
                  isSelected={value.some(v => v.value === item.value)}
                  onChange={() => handleSelect(item)}
                />
                <div className={styles.optionContent}>
                  {renderStatusLabel(dataMap[Number(item.value)])}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
};

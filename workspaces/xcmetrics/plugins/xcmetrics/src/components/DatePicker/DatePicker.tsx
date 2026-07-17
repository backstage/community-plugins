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

import React from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  label: string;
  value?: string;
  onDateChange?: (date: string) => void;
}

export const DatePicker = ({
  label,
  onDateChange,
  value,
  ...inputProps
}: DatePickerProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={`date-picker-${label}`}>
        {label}
      </label>
      <input
        id={`date-picker-${label}`}
        className={styles.input}
        aria-label={label}
        type="date"
        value={value}
        onChange={event => onDateChange?.(event.target.value)}
        {...inputProps}
      />
    </div>
  );
};

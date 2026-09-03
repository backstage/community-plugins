/*
 * Copyright 2023 The Backstage Authors
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
import { Select } from '@backstage/ui';
import { memo } from 'react';
import SelectWindow from '../SelectWindow';
import styles from './Edit.module.css';

function EditControl({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  accumulateOptions,
  accumulate,
  setAccumulate,
  currencyOptions,
  currency,
  setCurrency,
}) {
  return (
    <div className={styles.wrapper}>
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
      />
      <div className={styles.formControl}>
        <Select
          id="aggregation-select"
          label="Breakdown"
          value={aggregateBy}
          onChange={value => {
            if (value !== null) setAggregateBy(String(value));
          }}
          options={aggregationOptions.map(opt => ({
            value: opt.value,
            label: opt.name,
          }))}
        />
      </div>
      <div className={styles.formControl}>
        <Select
          id="accumulate"
          label="Resolution"
          value={String(accumulate)}
          onChange={value => {
            if (value !== null) setAccumulate(value === 'true');
          }}
          options={accumulateOptions.map(opt => ({
            value: String(opt.value),
            label: opt.name,
          }))}
        />
      </div>
      <div className={styles.formControl}>
        <Select
          id="currency"
          label="Currency"
          value={currency}
          onChange={value => {
            if (value !== null) setCurrency(String(value));
          }}
          options={(currencyOptions ?? []).map(currencyVal => ({
            value: currencyVal,
            label: currencyVal,
          }))}
        />
      </div>
    </div>
  );
}

export default memo(EditControl);

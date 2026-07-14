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

import { Control, UseFormSetValue } from 'react-hook-form';
import { FormValues } from '../../types';
import { DateSelector } from '../DateSelector/DateSelector';
import styles from './DoubleDateSelector.module.css';

type Props = {
  control: Control<FormValues, object>;
  setValue: UseFormSetValue<FormValues>;
};

export const DoubleDateSelector = ({ control, setValue }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.startDate}>
        <DateSelector name="startDate" control={control} setValue={setValue} />
      </div>

      <span className={styles.dash}>-</span>
      <div className={styles.endDate}>
        <DateSelector name="endDate" control={control} setValue={setValue} />
      </div>
    </div>
  );
};

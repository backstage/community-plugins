/*
 * Copyright 2022 The Backstage Authors
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
import { sortBy } from 'lodash';

import { Select } from '@backstage/ui';

import { GCalendar } from '../../api';
import styles from './CalendarSelect.module.css';

type CalendarSelectProps = {
  disabled: boolean;
  selectedCalendars?: string[];
  setSelectedCalendars: (value: string[]) => void;
  calendars: GCalendar[];
};

export const CalendarSelect = ({
  disabled,
  selectedCalendars = [],
  setSelectedCalendars,
  calendars,
}: CalendarSelectProps) => {
  const options = sortBy(calendars, 'summary')
    .filter((calendar): calendar is GCalendar & { id: string } => !!calendar.id)
    .map(calendar => ({
      id: calendar.id,
      label: calendar.summary ?? calendar.id,
    }));

  return (
    <Select
      aria-label="Calendars"
      data-testid="calendars-select"
      className={styles.select}
      selectionMode="multiple"
      isDisabled={disabled || calendars.length === 0}
      options={options}
      value={selectedCalendars}
      onChange={value => setSelectedCalendars(value as string[])}
    />
  );
};

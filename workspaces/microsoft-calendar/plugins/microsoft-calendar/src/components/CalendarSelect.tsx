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
import { MicrosoftCalendar } from '../api';

type CalendarSelectProps = {
  disabled: boolean;
  selectedCalendarId?: string;
  setSelectedCalendarId: (value: string) => void;
  calendars: MicrosoftCalendar[];
};

export const CalendarSelect = ({
  disabled,
  selectedCalendarId,
  setSelectedCalendarId,
  calendars,
}: CalendarSelectProps) => {
  return (
    <select
      style={{
        width: '120px',
        padding: 'var(--bui-space-2)',
        border: '1px solid var(--bui-border-neutral)',
        borderRadius: 'var(--bui-radius-1)',
        backgroundColor: 'var(--bui-bg-surface-1)',
        color: 'var(--bui-fg-primary)',
        fontSize: 'var(--bui-font-size-3)',
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition:
          'border-color 150ms ease-in-out, background-color 150ms ease-in-out',
      }}
      disabled={disabled || calendars.length === 0}
      value={selectedCalendarId || ''}
      onChange={e => setSelectedCalendarId(e.target.value)}
    >
      {sortBy(calendars, 'name').map(c => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
};

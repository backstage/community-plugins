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

import { Button } from '@backstage/ui';
import { CalendarEvent } from './CalendarEvent';
import mockEvents from './eventMock.json';
import { MicrosoftCalendarEvent } from '../api';
import styles from './SignInContent.module.css';

type Props = {
  handleAuthClick: (e: any) => void;
};

export const SignInContent = ({ handleAuthClick }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.mockContent}>
        {(mockEvents as MicrosoftCalendarEvent[]).map(event => (
          <CalendarEvent key={event.id} event={event} />
        ))}
      </div>

      <div className={styles.overlay}>
        <Button variant="primary" onClick={handleAuthClick}>
          Sign in
        </Button>
      </div>
    </div>
  );
};

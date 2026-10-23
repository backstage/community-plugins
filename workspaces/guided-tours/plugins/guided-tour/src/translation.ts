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
import { createTranslationRef } from '@backstage/frontend-plugin-api';

/** @alpha */
export const guidedTourTranslationRef = createTranslationRef({
  id: 'guided-tour',
  messages: {
    overlay: {
      previous: 'Previous',
      next: 'Next',
      done: 'Done',
      close: 'Close tour',
      counter: 'Step {{current}} of {{total}}',
      clickToContinue: 'Click the highlighted element to continue.',
      loading: 'Looking for the next step…',
    },
    page: {
      title: 'Guided tours',
      description:
        'Replay any tour at any time. Tours marked for login start on their own the first time you sign in.',
      empty: 'No guided tours are installed.',
      steps: '{{n}} steps',
      start: 'Start',
      continue: 'Continue',
      restart: 'Restart',
      resetAll: 'Reset all tours',
      resetAllTitle: 'Reset all tours?',
      resetAllBody:
        'Progress of every tour is cleared and the welcome tours play again on your next visit.',
      cancel: 'Cancel',
      confirm: 'Reset',
      autoStartLogin: 'Starts on login',
      autoStartRoute: 'Starts on first visit of {{route}}',
      status: {
        new: 'New',
        inProgress: 'In progress',
        completed: 'Completed',
        dismissed: 'Dismissed',
      },
    },
  },
});

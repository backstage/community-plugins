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
import { GuidedTourBlueprint } from '@backstage-community/plugin-guided-tours-react';

/** Starts on the first visit of the notifications page. */
export const notificationsTour = GuidedTourBlueprint.make({
  name: 'notifications',
  params: {
    title: 'Your notifications',
    description: 'Reading, filtering and clearing notifications.',
    autoStart: { route: '/notifications' },
    order: 12,
    steps: [
      {
        id: 'list',
        title: 'Unread first',
        route: '/notifications',
        target: { selector: 'table' },
        placement: 'top',
        content:
          'New notifications land here. Click a title to open what it points ' +
          'to, or use the icons on the right to save or mark a single one as read.',
      },
      {
        id: 'view',
        title: 'Read, saved, all',
        target: { selector: '.bui-SelectTrigger' },
        placement: 'right',
        content:
          'Switch the view between unread, read, saved and all notifications. ' +
          'The other filters limit by time, severity and topic.',
      },
      {
        id: 'mark-all',
        title: 'Inbox zero',
        target: { selector: 'button[aria-label="Mark all read"]' },
        placement: 'bottom',
        onMissingTarget: 'center',
        content: 'One click marks everything in the current view as read.',
      },
    ],
  },
});

import type { CardSettings } from '@backstage/plugin-home-react';

/*
 * Copyright 2025 The Backstage Authors
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

/**
 * Props for AnnouncemtsHomepageCard
 *
 * @public
 */
export interface AnnouncementsHomepageProps {
  max?: number;
  category?: string;
  active?: boolean;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
  hideStartAt?: boolean;
}

export const AnnouncemtsHomepageCardSettings: CardSettings = {
  schema: {
    title: 'Announcements settings',
    type: 'object',
    definitions: {
      sortBy: {
        type: 'string',
        anyOf: [
          { const: 'created_at', title: 'Created At' },
          { const: 'start_at', title: 'Start At' },
        ],
      },
      order: {
        type: 'string',
        anyOf: [
          { const: 'asc', title: 'Ascending' },
          { const: 'desc', title: 'Descending' },
        ],
      },
    },
    properties: {
      max: {
        type: 'number',
        title: 'Response Limit',
        description: 'Maximum number of announcements to display',
        minimum: 0,
        default: 5,
      },
      category: {
        type: ['string', 'null'],
        title: 'Category',
        description: 'Filter announcements by category',
      },
      active: {
        type: 'boolean',
        title: 'Active Only',
        description: 'Show only active announcements',
        default: true,
      },
      sortBy: {
        title: 'Sort By',
        $ref: '#/definitions/sortBy',
        default: 'created_at',
      },
      order: {
        $ref: '#/definitions/order',
        title: 'Order',
        default: 'asc',
      },
      hideStartAt: {
        type: 'boolean',
        title: 'Hide Start Date',
        default: true,
      },
    },
  },
  uiSchema: {
    category: {
      'ui:emptyValue': undefined,
    },
    order: {
      'ui:widget': 'radio',
      'ui:options': {
        inline: true,
      },
    },
    sortBy: {
      'ui:widget': 'radio',
      'ui:options': {
        inline: true,
      },
    },
  },
};

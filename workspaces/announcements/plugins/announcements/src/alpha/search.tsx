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
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';
import { RiMegaphoneLine } from '@remixicon/react';

/**
 * Search result list item that renders announcement search results.
 *
 * @remarks
 * Extension ID: `search-result-list-item:announcements`
 *
 * @alpha
 */
export const announcementsSearchResultListItem =
  SearchResultListItemBlueprint.make({
    params: {
      component: () =>
        import('../components/AnnouncementSearchResultListItem').then(
          m => m.AnnouncementSearchResultListItem,
        ),
      predicate: result => result.type === 'announcements',
      icon: <RiMegaphoneLine />,
    },
  });

/**
 * Search filter result type that adds "Announcements" as a filterable
 * result type in the search page.
 *
 * @remarks
 * Extension ID: `search-filter-result-type:announcements/announcements-results-type`
 *
 * @alpha
 */
export const announcementsSearchFilterResultType =
  SearchFilterResultTypeBlueprint.make({
    name: 'announcements-results-type',
    params: {
      name: 'Announcements',
      value: 'announcements',
      icon: <RiMegaphoneLine />,
    },
  });

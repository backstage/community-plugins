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

import { Tag as BuiTagComponent, TagGroup } from '@backstage/ui';
import { useRouteRef } from '@backstage/frontend-plugin-api';
import { Tag } from '@backstage-community/plugin-announcements-common';

import { rootRouteRef } from '../../../../routes';

export type AnnouncementTagsProps = {
  tags?: Tag[];
};

export const AnnouncementTags = (props: AnnouncementTagsProps) => {
  const announcementsLink = useRouteRef(rootRouteRef);

  if (!props.tags || props.tags.length === 0) {
    return null;
  }

  return (
    <TagGroup>
      {props.tags.map(tag => (
        <BuiTagComponent
          key={tag.slug}
          href={`${announcementsLink?.()}?tags=${tag.slug}`}
        >
          {tag.title}
        </BuiTagComponent>
      ))}
    </TagGroup>
  );
};

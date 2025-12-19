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

import { arrayify } from '@backstage-community/plugin-manage-react';

export interface AttachTo {
  entities: boolean;
  starred: boolean;
  all: boolean;
  tabs: string[];
}

export function parseAttachTo(
  attachTo: string | string[] | undefined,
): AttachTo {
  const ret: AttachTo = {
    entities: false,
    starred: false,
    all: false,
    tabs: [],
  };
  if (!attachTo) {
    return ret;
  }
  const attachTabs = arrayify(attachTo);

  if (attachTabs.includes('$entities')) {
    ret.entities = true;
  }
  if (attachTabs.includes('$starred')) {
    ret.starred = true;
  }
  if (attachTabs.includes('$all')) {
    ret.all = true;
  } else {
    ret.tabs = attachTabs.filter(a => !a.startsWith('$'));
  }
  return ret;
}

export interface AttachToMulti {
  entities: { show: boolean; multi: boolean };
  starred: { show: boolean; multi: boolean };
  all: { show: boolean; multi: boolean };
  tabs: { tab: string; multi: boolean }[];
}

export function parseAttachToMulti(
  attachTo: (string | { tab: string; multi?: boolean })[] | undefined,
): AttachToMulti {
  const ret: AttachToMulti = {
    entities: { show: false, multi: true },
    starred: { show: false, multi: true },
    all: { show: false, multi: true },
    tabs: [],
  };
  if (!attachTo) {
    return ret;
  }

  if (attachTo.includes('$entities')) {
    ret.entities.show = true;
  }
  if (attachTo.includes('$starred')) {
    ret.starred.show = true;
  }
  if (attachTo.includes('$all')) {
    ret.all.show = true;
  } else {
    // Regular tabs
    ret.tabs = attachTo
      .map(tab =>
        typeof tab === 'string'
          ? { tab, multi: true }
          : { tab: tab.tab, multi: tab.multi ?? true },
      )
      .filter(tab => !tab.tab.startsWith('$'));
  }

  // Special tabs
  attachTo.forEach(tab => {
    if (typeof tab === 'object') {
      if (tab.tab === '$entities') {
        ret.entities.show = true;
        ret.entities.multi = tab.multi ?? true;
      } else if (tab.tab === '$starred') {
        ret.starred.show = true;
        ret.starred.multi = tab.multi ?? true;
      } else if (tab.tab === '$all') {
        ret.all.show = true;
        ret.all.multi = tab.multi ?? true;
      }
    }
  });

  return ret;
}

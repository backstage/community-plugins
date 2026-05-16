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

import { Fragment, useMemo } from 'react';

import { HeaderTab, PluginHeader } from '@backstage/ui';
import { useRouteRef } from '@backstage/frontend-plugin-api';

import { ManageStaticConfig } from '@backstage-community/plugin-manage-react';

import { RiPulseAiLine } from '@remixicon/react';

import { SubRouteTab } from '../ManageTabs';
import { rootRouteRef } from '../../routes';
import { HeaderLabelItem } from './types';

export interface ManagePageHeaderProps {
  config: ManageStaticConfig;
  labelsElements: HeaderLabelItem[];
  tabs: SubRouteTab[];
}

export function ManagePageHeader(props: ManagePageHeaderProps) {
  const { config, labelsElements, tabs } = props;
  const subTitle = config.subtitle ?? 'Things you own and work with';

  const manageRoutePath = useRouteRef(rootRouteRef);

  if (!manageRoutePath) {
    throw new Error('Manage page not found');
  }

  const headerTabs = useMemo(
    () =>
      tabs.map(
        (tab): HeaderTab => ({
          label: tab.title,
          href: mergePaths(manageRoutePath(), tab.path),
          id: tab.path,
          matchStrategy: 'prefix',
        }),
      ),
    [tabs, manageRoutePath],
  );

  const actions = useMemo(
    () => (
      <>
        {labelsElements.map(label => (
          <Fragment key={label.key}>{label.element}</Fragment>
        ))}
      </>
    ),
    [labelsElements],
  );

  return (
    <PluginHeader
      title={`Manage — ${subTitle}`}
      icon={<RiPulseAiLine />}
      customActions={actions}
      tabs={headerTabs}
    />
  );
}

function mergePaths(a: string, b: string) {
  const base = a.replace(/\/+$/, '');
  const path = b.replace(/^\/+/, '');
  return path ? `${base}/${path}` : base;
}

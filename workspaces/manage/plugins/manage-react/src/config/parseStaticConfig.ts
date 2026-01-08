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

import { ConfigApi } from '@backstage/frontend-plugin-api';

import { ManageStaticConfig } from './types';

/**
 * This is an internal utility function
 *
 * @public
 */
export function parseStaticConfig(
  config: ConfigApi | undefined,
): ManageStaticConfig {
  const title = config?.getOptionalString('manage.title');
  const subtitle = config?.getOptionalString('manage.subtitle');
  const themeId = config?.getOptionalString('manage.themeId');
  const combined = config?.getOptionalBoolean('manage.combined');
  const showCombined =
    config?.getOptionalBoolean('manage.showCombined') ?? true;
  const enableStarredEntities =
    config?.getOptionalBoolean('manage.enableStarredEntities') ?? true;
  const showOrganizationChart =
    config?.getOptionalBoolean('manage.showOrganizationChart') ?? true;
  const enableWholeOrganization =
    config?.getOptionalBoolean('manage.enableWholeOrganization') ?? false;

  const tabOrder = config?.getOptionalStringArray('manage.order.tabs') ?? [];
  const kindOrder = config?.getOptionalStringArray('manage.order.kinds') ?? [];

  const widgetOrderCards = (
    config?.getOptionalStringArray('manage.order.cards') ?? []
  ).map(prefixCardWidgetNodeId);
  const widgetOrderContentAbove = (
    config?.getOptionalStringArray('manage.order.contentAbove') ?? []
  ).map(prefixContentWidgetNodeId);
  const widgetOrderContentBelow = (
    config?.getOptionalStringArray('manage.order.contentBelow') ?? []
  ).map(prefixContentWidgetNodeId);
  const columnsOrder = (
    config?.getOptionalStringArray('manage.order.columns') ?? []
  ).map(prefixColumnNodeId);

  return {
    title,
    subtitle,
    combined,
    showCombined,
    enableStarredEntities,
    showOrganizationChart,
    enableWholeOrganization,
    themeId,

    tabOrder,
    kindOrder,

    widgetOrderCards,
    widgetOrderContentAbove,
    widgetOrderContentBelow,
    columnsOrder,
  };
}

const reFullNodeId = /^.+:.+\/.+$/;

function prefixColumnNodeId(id: string) {
  if (id.match(reFullNodeId)) {
    return id;
  }
  return `manage-column:${id}`;
}

function prefixCardWidgetNodeId(id: string) {
  if (id.match(reFullNodeId)) {
    return id;
  }
  return `manage-card-widget:${id}`;
}

function prefixContentWidgetNodeId(id: string) {
  if (id.match(reFullNodeId)) {
    return id;
  }
  return `manage-content-widget:${id}`;
}

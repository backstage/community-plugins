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
  PageBlueprint,
  createExtensionInput,
  configApiRef,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';

import {
  parseStaticConfig,
  parseDynamicConfig,
  ManageSettingsBlueprint,
  ManageTabBlueprint,
  ManageProviderBlueprint,
  ManageHeaderLabelBlueprint,
  ManageConfigBlueprint,
  ManageEntityColumnBlueprint,
  ManageEntityCardWidgetBlueprint,
  ManageEntityContentWidgetBlueprint,
} from '@backstage-community/plugin-manage-react';

import { rootRouteRef } from '../../routes';
import type { Setting } from '../../components/Settings/types';
import type {
  CardWidgetSpecInput,
  ColumnSpec,
  ContentWidgetSpec,
  DecoratedSubRouteTab,
} from '../../components/ManagePage/types';
import type { HeaderLabelItem } from '../../components/ManagePageHeader';

export const managePage = PageBlueprint.makeWithOverrides({
  inputs: {
    config: createExtensionInput([ManageConfigBlueprint.dataRefs.config]),
    headerLabels: createExtensionInput([
      ManageHeaderLabelBlueprint.dataRefs.element,
    ]),
    providers: createExtensionInput([
      ManageProviderBlueprint.dataRefs.provider,
    ]),
    tabs: createExtensionInput([
      ManageTabBlueprint.dataRefs.title,
      ManageTabBlueprint.dataRefs.path,
      ManageTabBlueprint.dataRefs.fullHeight,
      ManageTabBlueprint.dataRefs.condition,
      ManageTabBlueprint.dataRefs.element,
    ]),
    columns: createExtensionInput([
      ManageEntityColumnBlueprint.dataRefs.column,
      ManageEntityColumnBlueprint.dataRefs.attachTo,
      ManageEntityColumnBlueprint.dataRefs.condition,
    ]),
    cardWidgets: createExtensionInput([
      ManageEntityCardWidgetBlueprint.dataRefs.attachTo,
      ManageEntityCardWidgetBlueprint.dataRefs.condition,
      ManageEntityCardWidgetBlueprint.dataRefs.card,
    ]),
    contentWidgets: createExtensionInput([
      ManageEntityContentWidgetBlueprint.dataRefs.accordion,
      ManageEntityContentWidgetBlueprint.dataRefs.attachTo,
      ManageEntityContentWidgetBlueprint.dataRefs.condition,
      ManageEntityContentWidgetBlueprint.dataRefs.element,
    ]),
    settings: createExtensionInput([
      ManageSettingsBlueprint.dataRefs.data,
      ManageSettingsBlueprint.dataRefs.element,
    ]),
  },
  factory(originalFactory, { inputs, apis, node: pluginNode }) {
    return originalFactory({
      path: '/manage',
      routeRef: convertLegacyRouteRef(rootRouteRef),
      loader: async () => {
        const { ManagePageProviders, ManagePage } = await import(
          '../../components/ManagePage'
        );

        const staticConfig = parseStaticConfig(apis.get(configApiRef));
        const dynamicConfig = parseDynamicConfig(inputs.config);

        const headerLabels = inputs.headerLabels.map(
          (headerLabel): HeaderLabelItem => ({
            key: headerLabel.node.spec.id,
            element: headerLabel.get(
              ManageHeaderLabelBlueprint.dataRefs.element,
            ),
          }),
        );

        const providers = inputs.providers.map(provider =>
          provider.get(ManageProviderBlueprint.dataRefs.provider),
        );

        const tabs = inputs.tabs.map((tab): DecoratedSubRouteTab => {
          const { fullHeight, resizeChild } = tab.get(
            ManageTabBlueprint.dataRefs.fullHeight,
          );
          const children = tab.get(ManageTabBlueprint.dataRefs.element);

          return {
            node: tab.node,
            title: tab.get(ManageTabBlueprint.dataRefs.title),
            path: tab.get(ManageTabBlueprint.dataRefs.path),
            condition: tab.get(ManageTabBlueprint.dataRefs.condition),
            children,
            fullHeight: fullHeight ? { resizeChild } : false,
          };
        });

        const columns = inputs.columns.map((column): ColumnSpec => {
          return {
            node: column.node,
            column: column.get(ManageEntityColumnBlueprint.dataRefs.column),
            condition: column.get(
              ManageEntityColumnBlueprint.dataRefs.condition,
            ),
            attachTo: column.get(ManageEntityColumnBlueprint.dataRefs.attachTo)
              .attachTo,
          };
        });

        const cardWidgets = inputs.cardWidgets.map(
          (widget): CardWidgetSpecInput => ({
            node: widget.node,
            attachTo: widget.get(
              ManageEntityCardWidgetBlueprint.dataRefs.attachTo,
            ).attachTo,
            condition: widget.get(
              ManageEntityCardWidgetBlueprint.dataRefs.condition,
            ),
            card: widget.get(ManageEntityCardWidgetBlueprint.dataRefs.card),
          }),
        );

        const contentWidgets = inputs.contentWidgets.map(
          (widget): ContentWidgetSpec => ({
            node: widget.node,
            accordion: widget.get(
              ManageEntityContentWidgetBlueprint.dataRefs.accordion,
            ),
            attachTo: widget.get(
              ManageEntityContentWidgetBlueprint.dataRefs.attachTo,
            ).attachTo,
            condition: widget.get(
              ManageEntityContentWidgetBlueprint.dataRefs.condition,
            ),
            element: widget.get(
              ManageEntityContentWidgetBlueprint.dataRefs.element,
            ),
          }),
        );

        const settings = inputs.settings.map((setting): Setting => {
          const settingData = setting.get(
            ManageSettingsBlueprint.dataRefs.data,
          );

          return {
            title: settingData.title,
            subtitle: settingData.subtitle,
            action: settingData.action,
            element: setting.get(ManageSettingsBlueprint.dataRefs.element),
            node: setting.node,
          };
        });

        return compatWrapper(
          <ManagePageProviders
            kinds={staticConfig.kinds}
            combined={staticConfig.combined}
            providers={providers}
            dynamicConfig={dynamicConfig}
          >
            <ManagePage
              pluginNode={pluginNode}
              apis={apis}
              tabs={tabs}
              columns={columns}
              cardWidgets={cardWidgets}
              contentWidgets={contentWidgets}
              config={staticConfig}
              settings={settings}
              labelsElements={headerLabels}
              showCombined={staticConfig.showCombined}
            />
          </ManagePageProviders>,
        );
      },
    });
  },
});

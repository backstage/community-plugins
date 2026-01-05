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

import { useMemo } from 'react';

import {
  PageBlueprint,
  createExtensionInput,
  ApiHolder,
  configApiRef,
  ExtensionBoundary,
  AppNode,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';

import {
  useOwnersAndEntities,
  ManageConditionOptions,
  ManageStaticConfig,
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
  TabContentFullHeight,
  ManageCardRef,
  CardWidget,
} from '@backstage-community/plugin-manage-react';

import { ManageTabsImpl, SubRouteTab } from '../../components/ManageTabs';
import { rootRouteRef } from '../../routes';
import { OrganizationGraphImpl } from '../../components/OrganizationGraph';
import { Setting } from '../../components/Settings/types';
import { useFilteredTabs } from './useTabs';
import { useWidgetContents } from './useWidgetContents';
import { useWidgetCards } from './useWidgetCards';
import { useColumns } from './useColumns';
import {
  CardWidgetSpec,
  CardWidgetSpecInput,
  ColumnSpec,
  ContentWidgetSpec,
  DecoratedSubRouteTab,
  ManagePageOptions,
} from './types';
import { sortComponents, useOrder } from './sort';
import { wrapAccordion } from './wrapAccordion';

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
  factory(originalFactory, { inputs, apis }) {
    return originalFactory({
      path: '/manage',
      routeRef: convertLegacyRouteRef(rootRouteRef),
      loader: async () => {
        const { ManagePageNew } = await import('../../components/ManagePage');

        const staticConfig = parseStaticConfig(apis.get(configApiRef));
        const dynamicConfig = parseDynamicConfig(inputs.config);

        const headerLabels = inputs.headerLabels.map(headerLabel =>
          headerLabel.get(ManageHeaderLabelBlueprint.dataRefs.element),
        );

        const providers = inputs.providers.map(provider =>
          provider.get(ManageProviderBlueprint.dataRefs.provider),
        );

        const tabs = inputs.tabs.map((tab): DecoratedSubRouteTab => {
          const { fullHeight, resizeChild } = tab.get(
            ManageTabBlueprint.dataRefs.fullHeight,
          );
          const children = tab.get(ManageTabBlueprint.dataRefs.element);

          const wrappedChildren = fullHeight ? (
            <TabContentFullHeight resizeChild={resizeChild}>
              {children}
            </TabContentFullHeight>
          ) : (
            children
          );

          return {
            node: tab.node,
            title: tab.get(ManageTabBlueprint.dataRefs.title),
            path: tab.get(ManageTabBlueprint.dataRefs.path),
            condition: tab.get(ManageTabBlueprint.dataRefs.condition),
            children: wrappedChildren,
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
          <ManagePageNew
            providers={providers}
            combined={staticConfig.combined}
            showCombined={staticConfig.showCombined}
            dynamicConfig={dynamicConfig}
            staticConfig={staticConfig}
            labels={headerLabels}
          >
            <ManagePageInner
              apis={apis}
              tabs={tabs}
              columns={columns}
              cardWidgets={cardWidgets}
              contentWidgets={contentWidgets}
              config={staticConfig}
              settings={settings}
            />
          </ManagePageNew>,
        );
      },
    });
  },
});

interface ManagePageInnerProps {
  apis: ApiHolder;
  tabs: readonly DecoratedSubRouteTab[];
  columns: ColumnSpec[];
  cardWidgets: CardWidgetSpecInput[];
  contentWidgets: ContentWidgetSpec[];
  config: ManageStaticConfig;
  settings: Setting[];
}

function ManagePageInner(props: ManagePageInnerProps) {
  const { apis, tabs, columns, cardWidgets, contentWidgets, config, settings } =
    props;

  const { owners, entities } = useOwnersAndEntities();

  const conditionOptions = useMemo(
    (): ManageConditionOptions => ({ apis, owners, entities }),
    [apis, owners, entities],
  );

  const resolvedCardsWidgets = useMemo((): CardWidgetSpec[] => {
    const makeCardElement = (
      node: AppNode,
      card: ManageCardRef,
    ): JSX.Element => {
      if ('element' in card) {
        return card.element;
      } else if ('card' in card) {
        return ExtensionBoundary.lazy(node, () =>
          card
            .card({ apis, owners, entities })
            .then(({ title, subtitle, action, content }) => (
              <CardWidget
                title={title}
                content={content}
                subtitle={subtitle}
                action={action}
              />
            )),
        );
      }
      throw new Error('Invalid ManageCardRef');
    };

    return cardWidgets.map(
      (widget): CardWidgetSpec => ({
        node: widget.node,
        attachTo: widget.attachTo,
        condition: widget.condition,
        element: makeCardElement(widget.node, widget.card),
      }),
    );
  }, [apis, owners, entities, cardWidgets]);

  const {
    widgetOrderCards,
    widgetOrderContentAbove,
    widgetOrderContentBelow,
    columnsOrder,
    isContentFooter,
  } = useOrder(config);

  const managePageOptions: ManagePageOptions = {
    isContentFooter,
    combined: {
      cards: [],
      header: [],
      footer: [],
      columns: [],
    },
    kinds: {},
    starred:
      config.enableStarredEntities === false
        ? false
        : {
            cards: [],
            header: [],
            footer: [],
            columns: [],
          },
  };

  const filteredTabs = useFilteredTabs(tabs, conditionOptions);

  useWidgetContents(contentWidgets, conditionOptions, managePageOptions);
  useWidgetCards(resolvedCardsWidgets, conditionOptions, managePageOptions);
  useColumns(columns, conditionOptions, managePageOptions);

  // Order widgets, header content, footers content and columns by the config
  const combined = {
    cards: sortComponents(
      managePageOptions.combined.cards,
      widgetOrderCards,
    ).map(w => w.element),
    header: sortComponents(
      managePageOptions.combined.header,
      widgetOrderContentAbove,
    ).map(w => wrapAccordion(w)),
    footer: sortComponents(
      managePageOptions.combined.footer,
      widgetOrderContentBelow,
    ).map(w => wrapAccordion(w)),
    columns: sortComponents(managePageOptions.combined.columns, columnsOrder),
  };
  const starred =
    managePageOptions.starred === false
      ? false
      : {
          cards: sortComponents(
            managePageOptions.starred.cards,
            widgetOrderCards,
          ).map(w => w.element),
          header: sortComponents(
            managePageOptions.starred.header,
            widgetOrderContentAbove,
          ).map(w => wrapAccordion(w)),
          footer: sortComponents(
            managePageOptions.starred.footer,
            widgetOrderContentBelow,
          ).map(w => wrapAccordion(w)),
          columns: sortComponents(
            managePageOptions.starred.columns,
            columnsOrder,
          ),
        };
  const kinds = Object.fromEntries(
    Object.entries(managePageOptions.kinds).map(([kind, def]) => [
      kind,
      {
        cards: sortComponents(def.cards, widgetOrderCards).map(w => w.element),
        header: sortComponents(def.header, widgetOrderContentAbove).map(w =>
          wrapAccordion(w),
        ),
        footer: sortComponents(def.footer, widgetOrderContentBelow).map(w =>
          wrapAccordion(w),
        ),
        columns: sortComponents(def.columns, columnsOrder),
      },
    ]),
  );

  const organizationTab: SubRouteTab[] = !config.showOrganizationChart
    ? []
    : [
        {
          path: 'organization',
          title: 'Organization',
          children: (
            <OrganizationGraphImpl
              enableWholeOrganization={config.enableWholeOrganization}
            />
          ),
        },
      ];

  return (
    <ManageTabsImpl
      combined={combined}
      kinds={kinds}
      starred={starred}
      tabsAfter={[...organizationTab, ...filteredTabs]}
      customSettings={settings}
    />
  );
}

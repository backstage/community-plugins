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

import { useMemo } from 'react';

import {
  ApiHolder,
  ExtensionBoundary,
  AppNode,
} from '@backstage/frontend-plugin-api';

import {
  useOwnersAndEntities,
  ManageConditionOptions,
  ManageStaticConfig,
  ManageCardRef,
  CardWidget,
} from '@backstage-community/plugin-manage-react';

import {
  ManageTabs,
  ManageTabsProps,
  SubRouteTab,
} from '../../components/ManageTabs';
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
import { HeaderLabelItem } from '../ManagePageHeader';

export interface ManagePageProps {
  pluginNode: AppNode;
  apis: ApiHolder;
  tabs: readonly DecoratedSubRouteTab[];
  columns: ColumnSpec[];
  cardWidgets: CardWidgetSpecInput[];
  contentWidgets: ContentWidgetSpec[];
  config: ManageStaticConfig;
  settings: Setting[];
  labelsElements: HeaderLabelItem[];
  showCombined: boolean;
}

export function ManagePage(props: ManagePageProps) {
  const pageData = useManagePage(props);
  return <ManageTabs {...pageData} />;
}

/**
 * Parses and configures the page data;
 * Tabs, table columns, cards, content widgets...
 */
function useManagePage(props: ManagePageProps): ManageTabsProps {
  const {
    pluginNode,
    apis,
    tabs,
    columns,
    cardWidgets,
    contentWidgets,
    config,
    settings,
    labelsElements,
    showCombined,
  } = props;

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
          fullHeight: { resizeChild: true },
          children: ExtensionBoundary.lazy(pluginNode, () =>
            import('../../components/OrganizationGraph').then(m => (
              <m.OrganizationGraphImpl
                enableWholeOrganization={config.enableWholeOrganization}
              />
            )),
          ),
        },
      ];

  return {
    combined,
    kinds,
    starred,
    tabsAfter: [...organizationTab, ...filteredTabs],
    customSettings: settings,
    config,
    labelsElements,
    showCombined,
  };
}

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

import { Box, Text } from '@backstage/ui';

import {
  ManageAccordion,
  ManageContentWidgetAccordion,
  useCurrentKindTitle,
  useCurrentTab,
} from '@backstage-community/plugin-manage-react';

export function wrapAccordion(props: {
  element: React.ReactNode;
  accordion: ManageContentWidgetAccordion;
}) {
  const { element, accordion } = props;

  return <WithinAccordion accordion={accordion} element={element} />;
}

function WithinAccordion(props: {
  element: React.ReactNode;
  accordion: ManageContentWidgetAccordion;
}) {
  const { element, accordion } = props;

  const currentTab = useCurrentTab();
  const kindTitle = useCurrentKindTitle();

  const inAccordion =
    typeof accordion.show === 'boolean'
      ? accordion.show
      : accordion.show?.[currentTab] ?? true;

  const title =
    typeof accordion.title === 'string'
      ? accordion.title
      : accordion.title({ currentTab, kindTitle });

  if (inAccordion) {
    return (
      <ManageAccordion
        title={title}
        name={accordion.key}
        defaultExpanded={accordion.defaultExpanded}
        perKind={accordion.perKind}
      >
        {element}
      </ManageAccordion>
    );
  }

  return (
    <Box mb="3">
      {accordion.showTitle && (
        <Box>
          <Text variant="title-x-small">{title}</Text>
        </Box>
      )}
      {element}
    </Box>
  );
}

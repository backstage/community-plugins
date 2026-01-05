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

import { PropsWithChildren } from 'react';

import {
  Accordion,
  AccordionTrigger,
  AccordionPanel,
  Box,
  Text,
} from '@backstage/ui';

import { useAccordionKey, useUserSettings } from '../../hooks';

/**
 * Props for {@link ManageAccordion}
 *
 * @public
 */
export interface ManageAccordionProps {
  /**
   * Title of the accordion
   */
  title: string;

  /**
   * Name of the accordion. This will be used to create accordion keys to save
   * the open/close state. This is intended to be a feature/plugin name.
   */
  name: string;

  /**
   * Make the accordion default-expanded. Defaults to false.
   */
  defaultExpanded?: boolean;

  /**
   * Saves the expanded state per kind. Defaults to false, meaning the expanded
   * state is shared between all kinds.
   */
  perKind?: boolean;
}

/**
 * Renders a MUI Accordion with a title and content. The open/close state of the
 * accordion is saved in the user settings.
 *
 * @public
 */
export function ManageAccordion(
  props: PropsWithChildren<ManageAccordionProps>,
) {
  const { title, name, defaultExpanded, perKind = false, children } = props;

  const accordionKey = useAccordionKey('manage-accordion', perKind);

  const { value: expanded, setValue: setExpanded } = useUserSettings(
    name,
    accordionKey,
    {
      defaultValue: defaultExpanded ?? false,
    },
  );

  return (
    <Box mb="3">
      <Accordion isExpanded={expanded} onExpandedChange={setExpanded}>
        <AccordionTrigger>
          <Text variant="title-x-small">{title}</Text>
        </AccordionTrigger>
        <AccordionPanel>{children}</AccordionPanel>
      </Accordion>
    </Box>
  );
}

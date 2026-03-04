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
import { createContext, useContext } from 'react';
import {
  Accordion,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Link,
  MenuAutocompleteListbox,
  MenuListBoxItem,
  MenuTrigger,
  SearchField,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';

export const defaultComponents = {
  Accordion,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Link,
  MenuAutocompleteListbox,
  MenuListBoxItem,
  MenuTrigger,
  SearchField,
  Tooltip,
  TooltipTrigger,
} as const;

export type ComponentContextProps = typeof defaultComponents;

export const ComponentContext =
  createContext<ComponentContextProps>(defaultComponents);

export const useComponents = () => {
  const context = useContext(ComponentContext);

  if (!context) {
    throw new Error(
      'useComponents must be used within a <ComponentContext.Provider />',
    );
  }

  return context;
};

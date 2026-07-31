/*
 * Copyright 2021 The Backstage Authors
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
  Accordion as BuiAccordion,
  AccordionTrigger,
  AccordionPanel,
} from '@backstage/ui';

interface AccordionProps {
  id: string;
  heading: string;
  secondaryHeading?: string | number;
  disabled?: boolean;
  unmountOnExit?: boolean;
}

export const Accordion = ({
  id,
  heading,
  secondaryHeading,
  disabled,
  children,
}: PropsWithChildren<AccordionProps>) => {
  return (
    <BuiAccordion id={id} isDisabled={disabled}>
      <AccordionTrigger
        title={heading}
        subtitle={
          secondaryHeading !== undefined ? String(secondaryHeading) : undefined
        }
      />
      <AccordionPanel>{children}</AccordionPanel>
    </BuiAccordion>
  );
};

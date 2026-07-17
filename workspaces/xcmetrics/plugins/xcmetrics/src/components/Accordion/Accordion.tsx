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

import {
  Accordion as BuiAccordion,
  AccordionTrigger,
  AccordionPanel,
} from '@backstage/ui';
import { PropsWithChildren, useState } from 'react';

interface AccordionProps {
  id: string;
  heading: string;
  secondaryHeading?: string | number;
  disabled?: boolean;
  unmountOnExit?: boolean;
}

export const Accordion = (props: PropsWithChildren<AccordionProps>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <BuiAccordion isDisabled={props.disabled} onExpandedChange={setIsExpanded}>
      <AccordionTrigger
        title={props.heading}
        subtitle={props.secondaryHeading?.toString()}
        aria-controls={`${props.id}-content`}
        id={`${props.id}-header`}
      />
      <AccordionPanel id={`${props.id}-content`}>
        {props.unmountOnExit && !isExpanded ? null : props.children}
      </AccordionPanel>
    </BuiAccordion>
  );
};

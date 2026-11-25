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

import { ReactElement } from 'react';
import { Button, ButtonLink, Flex } from '@backstage/ui';

export type ActionLink = {
  label: string;
  icon: ReactElement;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export const ActionLinks = ({ links }: { links: ActionLink[] }) => (
  <nav aria-label="Splunk On-Call actions">
    <Flex gap="2" align="center">
      {links.map(({ label, icon, href, disabled, onClick }) =>
        href ? (
          <ButtonLink
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            variant="tertiary"
            size="small"
            iconStart={icon}
            isDisabled={disabled}
            onPress={onClick}
          >
            {label}
          </ButtonLink>
        ) : (
          <Button
            key={label}
            variant="tertiary"
            size="small"
            iconStart={icon}
            isDisabled={disabled}
            onPress={onClick}
          >
            {label}
          </Button>
        ),
      )}
    </Flex>
  </nav>
);

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
import {
  RiComputerLine,
  RiFileTextLine,
  RiHistoryLine,
  RiSettings3Line,
} from '@remixicon/react';
import { Flex, Focusable, Text, Tooltip, TooltipTrigger } from '@backstage/ui';

import { useTranslation } from '../../hooks/useTranslation';
import {
  getRoleSourceLabel,
  getRoleSourceTooltip,
  ROLE_SOURCE_CONFIGURATION,
  ROLE_SOURCE_CSV,
  ROLE_SOURCE_LEGACY,
  ROLE_SOURCE_REST,
} from '../../utils/role-source-utils';

type RoleSourceProps = {
  source?: string;
};

const iconProps = {
  size: 16,
  'aria-hidden': true as const,
};

const getSourceIcon = (source?: string) => {
  switch (source) {
    case ROLE_SOURCE_CONFIGURATION:
      return <RiSettings3Line {...iconProps} />;
    case ROLE_SOURCE_CSV:
      return <RiFileTextLine {...iconProps} />;
    case ROLE_SOURCE_REST:
      return <RiComputerLine {...iconProps} />;
    case ROLE_SOURCE_LEGACY:
    default:
      return <RiHistoryLine {...iconProps} />;
  }
};

export const RoleSource = ({ source }: RoleSourceProps) => {
  const { t } = useTranslation();
  const label = getRoleSourceLabel(source, t);
  const tooltip = getRoleSourceTooltip(source, t);

  return (
    <TooltipTrigger delay={600}>
      <Focusable>
        <span
          style={{ display: 'inline-flex', cursor: 'help' }}
          data-testid={`role-source-${source ?? 'legacy'}`}
        >
          <Flex align="center" gap="1">
            {getSourceIcon(source)}
            <Text as="span" variant="body-medium">
              {label}
            </Text>
          </Flex>
        </span>
      </Focusable>
      <Tooltip>{tooltip}</Tooltip>
    </TooltipTrigger>
  );
};

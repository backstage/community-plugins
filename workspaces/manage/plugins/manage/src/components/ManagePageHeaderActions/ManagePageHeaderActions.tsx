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
import { useCallback } from 'react';

import { RiMergeCellsHorizontal } from '@remixicon/react';

import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';

import { useManagePageCombined } from './useFilters';

/** @internal */
export function ManagePageHeaderActions() {
  const { value: combined, setValue: setCombined } = useManagePageCombined();

  const handleChange = useCallback(
    (_event: unknown, checked: boolean) => {
      setCombined(checked);
    },
    [setCombined],
  );

  return (
    <TooltipTrigger>
      <Tooltip>Combine entity tabs</Tooltip>
      <ButtonIcon
        variant={combined ? 'primary' : 'tertiary'}
        icon={<RiMergeCellsHorizontal />}
        onClick={e => handleChange(e, !combined)}
      />
    </TooltipTrigger>
  );
}

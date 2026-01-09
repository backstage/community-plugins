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
import { GridColumnMenu } from '@mui/x-data-grid';
import { PinColumnMenuItem } from './PinColumnMenuItem';
import { CustomColumnMenuProps } from './types';

export function CustomColumnMenu(props: CustomColumnMenuProps) {
  const { isPinned, onTogglePin, ...gridProps } = props;

  return (
    <GridColumnMenu
      {...gridProps}
      slots={{
        // Hide `columnMenuFilterItem`
        columnMenuFilterItem: null,
        // custom pin menu item
        columnMenuPinItem: PinColumnMenuItem,
      }}
      slotProps={{
        columnMenuPinItem: {
          displayOrder: 10,
          isPinned,
          onTogglePin,
        },
      }}
    />
  );
}

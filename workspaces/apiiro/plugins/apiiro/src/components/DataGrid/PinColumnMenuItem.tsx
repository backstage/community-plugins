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
import { MouseEvent } from 'react';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { PushPin, PushPinOutlined } from '@mui/icons-material';
import { PinColumnMenuItemProps } from './types';

export function PinColumnMenuItem({
  colDef,
  onClick,
  isPinned,
  onTogglePin,
}: PinColumnMenuItemProps) {
  const handleClick = (event: MouseEvent<HTMLLIElement>) => {
    onTogglePin(colDef.field);
    onClick(event);
  };

  return (
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
        {isPinned ? (
          <PushPin fontSize="small" />
        ) : (
          <PushPinOutlined fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText>{isPinned ? 'Remove Pin' : 'Pin to left'}</ListItemText>
    </MenuItem>
  );
}

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

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ProviderDescriptor } from '@backstage-community/plugin-agentic-chat-common';

/** @public */
export interface ProviderSelectorProps {
  readonly providers: readonly ProviderDescriptor[];
  readonly activeProviderId: string;
  readonly onSwitch: (id: string) => Promise<void>;
}

const WRAPPER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
} as const;

// PatternFly isolation: force the dropdown menu list to render vertically.
// Without this, RHDH's PatternFly global CSS overrides ul/li display
// properties inside the Popover, causing horizontal rendering.
const MENU_PROPS = {
  PaperProps: {
    sx: {
      '& .MuiList-root': {
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      },
      '& .MuiMenuItem-root': {
        display: 'flex',
        boxSizing: 'border-box',
      },
    },
  },
} as const;

/**
 * Dropdown selector for choosing the active agent platform.
 * Selecting an unimplemented provider shows a placeholder in the config panel.
 */
export function ProviderSelector({
  providers,
  activeProviderId,
  onSwitch,
}: ProviderSelectorProps) {
  const [switching, setSwitching] = useState(false);

  const handleChange = useCallback(
    async (event: SelectChangeEvent) => {
      const value = event.target.value;
      if (value === activeProviderId || switching) return;
      setSwitching(true);
      try {
        await onSwitch(value);
      } finally {
        setSwitching(false);
      }
    },
    [activeProviderId, switching, onSwitch],
  );

  return (
    <Box sx={WRAPPER_SX}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="agent-platform-label">Agent Platform</InputLabel>
        <Select
          labelId="agent-platform-label"
          value={activeProviderId}
          onChange={handleChange}
          label="Agent Platform"
          disabled={switching}
          MenuProps={MENU_PROPS}
        >
          {providers.map(p => (
            <MenuItem key={p.id} value={p.id}>
              {p.displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {switching && <CircularProgress size={16} />}
    </Box>
  );
}

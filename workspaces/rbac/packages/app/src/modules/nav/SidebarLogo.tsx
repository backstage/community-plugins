/*
 * Copyright 2020 The Backstage Authors
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
  Link,
  sidebarConfig,
  useSidebarOpenState,
} from '@backstage/core-components';
import Box from '@mui/material/Box';
import {
  LogoFull,
  LogoIcon,
} from '@red-hat-developer-hub/backstage-plugin-theme';

export const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();

  return (
    <Box
      sx={{
        width: sidebarConfig.drawerWidthClosed,
        height: 3 * sidebarConfig.logoHeight,
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'center',
        mb: '-14px',
      }}
    >
      <Box
        sx={{
          width: sidebarConfig.drawerWidthClosed,
          ml: 3,
          '& svg g': { fill: '#fff' },
        }}
      >
        <Link to="/" underline="none" aria-label="Home">
          {isOpen ? <LogoFull /> : <LogoIcon />}
        </Link>
      </Box>
    </Box>
  );
};

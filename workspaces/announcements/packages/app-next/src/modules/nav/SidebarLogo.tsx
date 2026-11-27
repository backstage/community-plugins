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
import {
  Link,
  sidebarConfig,
  useSidebarOpenState,
} from '@backstage/core-components';
import { Box } from '@backstage/ui';
import { LogoFull } from './LogoFull';
import { LogoIcon } from './LogoIcon';
import styles from './SidebarLogo.module.css';

export const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();

  return (
    <Box
      className={styles.root}
      style={{
        width: sidebarConfig.drawerWidthClosed,
        height: 3 * sidebarConfig.logoHeight,
      }}
    >
      <Link
        to="/"
        underline="none"
        aria-label="Home"
        style={{ width: sidebarConfig.drawerWidthClosed, marginLeft: 24 }}
      >
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </Box>
  );
};

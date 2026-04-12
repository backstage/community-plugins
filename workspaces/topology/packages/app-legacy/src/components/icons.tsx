/*
 * Copyright 2024 The Backstage Authors
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
  RiAddCircleLine,
  RiBookOpenLine,
  RiGroupLine,
  RiHomeLine,
  RiMenuLine,
  RiPlugLine,
  RiSearchLine,
} from '@remixicon/react';

type SidebarIconProps = {
  fontSize?: 'medium' | 'large' | 'small' | 'inherit';
};

const createSidebarIcon = (Icon: typeof RiHomeLine, defaultSize = 24) => {
  const SidebarIcon = ({ fontSize }: SidebarIconProps) => (
    <Icon
      fontSize={fontSize}
      size={fontSize !== undefined ? undefined : defaultSize}
    />
  );
  return SidebarIcon;
};

export const HomeIcon = createSidebarIcon(RiHomeLine);
export const ExtensionIcon = createSidebarIcon(RiPlugLine);
export const LibraryBooksIcon = createSidebarIcon(RiBookOpenLine);
export const CreateComponentIcon = createSidebarIcon(RiAddCircleLine);
export const GroupIcon = createSidebarIcon(RiGroupLine);
export const MenuIcon = createSidebarIcon(RiMenuLine);
export const SearchIcon = createSidebarIcon(RiSearchLine);

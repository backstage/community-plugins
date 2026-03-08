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
import React from 'react';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import BugReportIcon from '@mui/icons-material/BugReport';
import SearchIcon from '@mui/icons-material/Search';
import TerminalIcon from '@mui/icons-material/Terminal';
import SpeedIcon from '@mui/icons-material/Speed';
import EventIcon from '@mui/icons-material/Event';
import PublicIcon from '@mui/icons-material/Public';
import AppsIcon from '@mui/icons-material/Apps';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';

/** Canonical icon names available for selection. */
export const ICON_NAMES = [
  'rocket',
  'code',
  'search',
  'build',
  'bug',
  'cloud',
  'settings',
  'terminal',
  'github',
  'storage',
  'school',
  'swap',
  'speed',
  'event',
  'public',
  'apps',
  'network',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const getIconForName = (iconName?: string): React.ReactElement => {
  switch (iconName?.toLowerCase()) {
    case 'rocket':
      return <RocketLaunchIcon />;
    case 'migration':
    case 'swap':
      return <SwapHorizIcon />;
    case 'learn':
    case 'school':
      return <SchoolIcon />;
    case 'code':
      return <CodeIcon />;
    case 'git':
    case 'github':
      return <GitHubIcon />;
    case 'database':
    case 'storage':
      return <StorageIcon />;
    case 'cloud':
      return <CloudIcon />;
    case 'config':
    case 'settings':
      return <SettingsIcon />;
    case 'build':
      return <BuildIcon />;
    case 'bug':
      return <BugReportIcon />;
    case 'search':
      return <SearchIcon />;
    case 'logs':
    case 'terminal':
      return <TerminalIcon />;
    case 'monitor':
    case 'speed':
      return <SpeedIcon />;
    case 'events':
    case 'event':
      return <EventIcon />;
    case 'globe':
    case 'public':
      return <PublicIcon />;
    case 'apps':
      return <AppsIcon />;
    case 'network':
      return <NetworkCheckIcon />;
    default:
      return <RocketLaunchIcon />;
  }
};

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
import type { SvgIconProps } from '@mui/material/SvgIcon';
import {
  AccessTime as AccessTimeIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  AltRoute as AltRouteIcon,
  Apps as AppsIcon,
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  CallSplit as CallSplitIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  ErrorOutline as ErrorOutlineIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  FlashOn as FlashOnIcon,
  FullscreenExit as FullscreenExitIcon,
  GitHub as GitHubIcon,
  HelpOutline as HelpOutlineIcon,
  History as HistoryIcon,
  HourglassEmpty as HourglassEmptyIcon,
  InfoOutlined as InfoOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardDoubleArrowDown as KeyboardDoubleArrowDownIcon,
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
  KeyboardDoubleArrowUp as KeyboardDoubleArrowUpIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Language as LanguageIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  MoreHoriz as MoreHorizIcon,
  OpenInFull as OpenInFullIcon,
  Pause as PauseIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  PlayArrow as PlayArrowIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Public as PublicIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  RoomService as RoomServiceIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  SettingsBackupRestore as SettingsBackupRestoreIcon,
  Share as ShareIcon,
  Sort as SortIcon,
  Stop as StopIcon,
  SwapHoriz as SwapHorizIcon,
  TextFields as TextFieldsIcon,
  Timer as TimerIcon,
  ViewInAr as ViewInArIcon,
  ViewModule as ViewModuleIcon,
  WarningAmber as WarningAmberIcon,
  Hub as HubIcon,
  VpnKey as VpnKeyIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { default as React } from 'react';
import { classes } from 'typestyle';
import { PFColors } from '@backstage-community/plugin-kiali-common/styles';
import type { Status as HealthStatus } from '@backstage-community/plugin-kiali-common/types';
import { kialiStyle } from '../styles/StyleUtils';

export const defaultIconStyle = kialiStyle({
  // nothing special
});

const iconStyle = kialiStyle({
  // Keep icons aligned with surrounding text; size is controlled via the `size` prop (defaulted below)
  verticalAlign: 'middle',
});

export type MUIIconComponent = React.ComponentType<SvgIconProps>;

export interface IconProps {
  className?: string;
  color?: string;
  dataTest?: string;
  // Intentionally loose: some call sites pass icons coming from common types (historically PatternFly).
  icon?: React.ComponentType<any>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeToFontSize = (
  size?: IconProps['size'],
): SvgIconProps['fontSize'] | undefined => {
  if (!size) {
    return undefined;
  }
  switch (size) {
    case 'sm':
      return 'small';
    case 'md':
      return 'medium';
    case 'lg':
    case 'xl':
      return 'large';
    default:
      return undefined;
  }
};

export const createIcon = (
  props: IconProps | HealthStatus,
  icon?: MUIIconComponent,
  colorIcon?: string,
): React.ReactElement => {
  // Support legacy calls like `createIcon(Status)` where Status has { icon, color }.
  const p: IconProps =
    (props as HealthStatus).icon && (props as any).priority !== undefined
      ? {
          icon: (props as HealthStatus).icon as any,
          color: (props as HealthStatus).color,
        }
      : (props as IconProps);

  const IconComponent = p.icon ?? icon ?? React.Fragment;
  const iconColor = p.color ?? colorIcon;
  const fontSize = sizeToFontSize(p.size);

  return React.createElement(IconComponent as any, {
    className: classes(p.className, iconStyle),
    fontSize,
    ...(iconColor ? { htmlColor: iconColor } : null),
    ...(p.dataTest ? { 'data-test': p.dataTest } : null),
  });
};

// createTooltipIcon wraps the icon in a span element. Tooltip child elements that are
// SVGs (icons) need to be wrapped in something to avoid the tooltip from disappearing on refresh.
// See: https://github.com/kiali/kiali/issues/3583 for more details.
export function createTooltipIcon(icon: any, dataTest?: string) {
  return (
    <span
      data-test={dataTest}
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}
    >
      {icon}
    </span>
  );
}

const make =
  (icon: MUIIconComponent, defaultColor?: string) => (props: IconProps) =>
    createIcon(props, icon, defaultColor);

// keep alphabetized (keys preserved for compatibility, icons are approximate)
export const KialiIcon: { [name: string]: React.FunctionComponent<IconProps> } =
  {
    AddMore: make(AddCircleOutlineIcon),
    AngleDoubleDown: make(KeyboardDoubleArrowDownIcon),
    AngleDoubleLeft: make(KeyboardDoubleArrowLeftIcon),
    AngleDoubleRight: make(KeyboardDoubleArrowRightIcon),
    AngleDoubleUp: make(KeyboardDoubleArrowUpIcon),
    AngleDown: make(KeyboardArrowDownIcon),
    AngleLeft: make(KeyboardArrowLeftIcon),
    AngleRight: make(KeyboardArrowRightIcon),
    AngleUp: make(KeyboardArrowUpIcon),
    Applications: make(AppsIcon),
    Back: make(ArrowBackIcon),
    Bell: make(PublicIcon),
    CircuitBreaker: make(FlashOnIcon),
    Clock: make(AccessTimeIcon),
    Close: make(CloseIcon),
    Compress: make(FullscreenExitIcon),
    Copy: make(ContentCopyIcon),
    Delete: make(RemoveCircleOutlineIcon),
    Download: make(FileDownloadIcon),
    Error: make(ErrorOutlineIcon, PFColors.Danger),
    Expand: make(OpenInFullIcon),
    FaultInjection: make(BlockIcon),
    Filter: make(FilterListIcon),
    Gateway: make(AltRouteIcon),
    Help: make(HelpOutlineIcon),
    History: make(HistoryIcon),
    Info: make(InfoOutlinedIcon, PFColors.Info),
    IstioConfig: make(TextFieldsIcon),
    InProgressIcon: make(HourglassEmptyIcon),
    LocalTime: make(PublicIcon),
    Mirroring: make(SwapHorizIcon),
    MoreLegend: make(MoreHorizIcon),
    MtlsLock: make(LockIcon),
    MtlsUnlock: make(LockOpenIcon),
    Ok: make(CheckCircleOutlineIcon, PFColors.Success),
    OnRunningIcon: make(PlayArrowIcon),
    OutOfMesh: make(ViewModuleIcon),
    Pause: make(PauseIcon),
    PauseCircle: make(PauseCircleOutlineIcon),
    Play: make(PlayArrowIcon),
    PlayCircle: make(PlayCircleOutlineIcon),
    Rank: make(SortIcon),
    Regex: make(TextFieldsIcon),
    Repository: make(GitHubIcon),
    RequestRouting: make(CallSplitIcon),
    ResetSettings: make(SettingsBackupRestoreIcon),
    RequestTimeout: make(TimerIcon),
    Save: make(SaveIcon),
    Services: make(RoomServiceIcon),
    Stop: make(StopIcon),
    Topology: make(AccountTreeIcon),
    TrafficShifting: make(ShareIcon),
    Unknown: make(HelpOutlineIcon),
    UserClock: make(ScheduleIcon),
    VirtualService: make(CallSplitIcon),
    Warning: make(WarningAmberIcon, PFColors.Warning),
    Website: make(LanguageIcon),
    Workloads: make(ViewInArIcon),
    Cluster: make(HubIcon),
    Key: make(VpnKeyIcon),
    Cubes: make(ViewInArIcon),
  };

Object.keys(KialiIcon).forEach(key => {
  KialiIcon[key].defaultProps = {
    className: iconStyle,
    size: 'sm',
  };
});

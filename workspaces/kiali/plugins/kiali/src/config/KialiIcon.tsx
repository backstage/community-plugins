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
import { Icon } from '@patternfly/react-core';
import {
  AngleDoubleDownIcon,
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  AngleDoubleUpIcon,
  AngleDownIcon,
  AngleLeftIcon,
  AngleRightIcon,
  ApplicationsIcon,
  ArrowLeftIcon,
  AsteriskIcon,
  BanIcon,
  BellIcon,
  BlueprintIcon,
  BoltIcon,
  BundleIcon,
  CloseIcon,
  CodeBranchIcon,
  CompressIcon,
  CopyIcon,
  EllipsisHIcon,
  ErrorCircleOIcon,
  ExpandIcon,
  FileDownloadIcon,
  FilterIcon,
  GlobeAmericasIcon,
  GlobeRouteIcon,
  HelpIcon,
  HistoryIcon,
  HomeIcon,
  InfoAltIcon,
  InProgressIcon,
  LockIcon,
  LockOpenIcon,
  MigrationIcon,
  MinusCircleIcon,
  OkIcon,
  OnRunningIcon,
  OutlinedClockIcon,
  PauseCircleIcon,
  PauseIcon,
  PficonTemplateIcon,
  PlayCircleIcon,
  PlayIcon,
  PlusCircleIcon,
  ProcessAutomationIcon,
  RepositoryIcon,
  SaveIcon,
  ServiceIcon,
  ShareAltIcon,
  SortAmountDownAltIcon,
  StopIcon,
  TopologyIcon,
  UnknownIcon,
  UserClockIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import * as React from 'react';
import { classes } from 'typestyle';
import { PFColors } from '../components/Pf/PfColors';
import { kialiStyle } from '../styles/StyleUtils';

export const defaultIconStyle = kialiStyle({
  // nothing special
});

const iconStyle = kialiStyle({
  width: '10px',
});

export interface IconProps {
  className?: string;
  color?: string;
  dataTest?: string;
  icon?: React.ComponentClass<SVGIconProps>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const conversorIconProps = (
  props: IconProps,
  icon: JSX.Element,
  colorIcon?: string,
) => {
  const colorI = props.color || colorIcon;
  const classNameIcon = colorI
    ? kialiStyle({
        color: colorI,
      })
    : undefined;
  return <Icon className={`${props.className} ${classNameIcon}`}>{icon}</Icon>;
};

// keep alphabetized
export const KialiIcon: { [name: string]: React.FunctionComponent<IconProps> } =
  {
    AddMore: (props: IconProps) =>
      conversorIconProps(props, <PlusCircleIcon />),
    AngleDoubleDown: (props: IconProps) =>
      conversorIconProps(props, <AngleDoubleDownIcon />),
    AngleDoubleLeft: (props: IconProps) =>
      conversorIconProps(props, <AngleDoubleLeftIcon />),
    AngleDoubleRight: (props: IconProps) =>
      conversorIconProps(props, <AngleDoubleRightIcon />),
    AngleDoubleUp: (props: IconProps) =>
      conversorIconProps(props, <AngleDoubleUpIcon />),
    AngleDown: (props: IconProps) =>
      conversorIconProps(props, <AngleDownIcon />),
    AngleLeft: (props: IconProps) =>
      conversorIconProps(props, <AngleLeftIcon />),
    AngleRight: (props: IconProps) =>
      conversorIconProps(props, <AngleRightIcon />),
    Applications: (props: IconProps) =>
      conversorIconProps(props, <ApplicationsIcon />),
    Back: (props: IconProps) => conversorIconProps(props, <ArrowLeftIcon />),
    Bell: (props: IconProps) => conversorIconProps(props, <BellIcon />),
    CircuitBreaker: (props: IconProps) =>
      conversorIconProps(props, <BoltIcon />),
    Clock: (props: IconProps) =>
      conversorIconProps(props, <OutlinedClockIcon />),
    Close: (props: IconProps) => conversorIconProps(props, <CloseIcon />),
    Compress: (props: IconProps) => conversorIconProps(props, <CompressIcon />),
    Copy: (props: IconProps) => conversorIconProps(props, <CopyIcon />),
    Delete: (props: IconProps) =>
      conversorIconProps(props, <MinusCircleIcon />),
    Download: (props: IconProps) =>
      conversorIconProps(props, <FileDownloadIcon />),
    Error: (props: IconProps) =>
      conversorIconProps(props, <ErrorCircleOIcon />, PFColors.Danger),
    Expand: (props: IconProps) => conversorIconProps(props, <ExpandIcon />),
    FaultInjection: (props: IconProps) =>
      conversorIconProps(props, <BanIcon />),
    Filter: (props: IconProps) => conversorIconProps(props, <FilterIcon />),
    Gateway: (props: IconProps) =>
      conversorIconProps(props, <GlobeRouteIcon />),
    Help: (props: IconProps) => conversorIconProps(props, <HelpIcon />),
    History: (props: IconProps) => conversorIconProps(props, <HistoryIcon />),
    Info: (props: IconProps) =>
      conversorIconProps(props, <InfoAltIcon />, PFColors.Info),
    IstioConfig: (props: IconProps) =>
      conversorIconProps(props, <PficonTemplateIcon />),
    InProgressIcon: (props: IconProps) =>
      conversorIconProps(props, <InProgressIcon />),
    LocalTime: (props: IconProps) =>
      conversorIconProps(props, <GlobeAmericasIcon />),
    Mirroring: (props: IconProps) =>
      conversorIconProps(props, <MigrationIcon />),
    MoreLegend: (props: IconProps) =>
      conversorIconProps(props, <EllipsisHIcon />),
    MtlsLock: (props: IconProps) => conversorIconProps(props, <LockIcon />),
    MtlsUnlock: (props: IconProps) =>
      conversorIconProps(props, <LockOpenIcon />),
    Ok: (props: IconProps) =>
      conversorIconProps(props, <OkIcon />, PFColors.Success),
    OnRunningIcon: (props: IconProps) =>
      conversorIconProps(props, <OnRunningIcon />),
    OutOfMesh: (props: IconProps) =>
      conversorIconProps(props, <BlueprintIcon />),
    Pause: (props: IconProps) => conversorIconProps(props, <PauseIcon />),
    PauseCircle: (props: IconProps) =>
      conversorIconProps(props, <PauseCircleIcon />),
    Play: (props: IconProps) => conversorIconProps(props, <PlayIcon />),
    PlayCircle: (props: IconProps) =>
      conversorIconProps(props, <PlayCircleIcon />),
    Rank: (props: IconProps) =>
      conversorIconProps(props, <SortAmountDownAltIcon />),
    Regex: (props: IconProps) => conversorIconProps(props, <AsteriskIcon />),
    Repository: (props: IconProps) =>
      conversorIconProps(props, <RepositoryIcon />),
    RequestRouting: (props: IconProps) =>
      conversorIconProps(props, <CodeBranchIcon />),
    ResetSettings: (props: IconProps) =>
      conversorIconProps(props, <ProcessAutomationIcon />),
    RequestTimeout: (props: IconProps) =>
      conversorIconProps(props, <OutlinedClockIcon />),
    Save: (props: IconProps) => conversorIconProps(props, <SaveIcon />),
    Services: (props: IconProps) => conversorIconProps(props, <ServiceIcon />),
    Stop: (props: IconProps) => conversorIconProps(props, <StopIcon />),
    Topology: (props: IconProps) => conversorIconProps(props, <TopologyIcon />),
    TrafficShifting: (props: IconProps) =>
      conversorIconProps(props, <ShareAltIcon />),
    Unknown: (props: IconProps) => conversorIconProps(props, <UnknownIcon />),
    UserClock: (props: IconProps) =>
      conversorIconProps(props, <UserClockIcon />),
    VirtualService: (props: IconProps) =>
      conversorIconProps(props, <CodeBranchIcon />),
    Warning: (props: IconProps) =>
      conversorIconProps(props, <WarningTriangleIcon />, PFColors.Warning),
    Website: (props: IconProps) => conversorIconProps(props, <HomeIcon />),
    Workloads: (props: IconProps) => conversorIconProps(props, <BundleIcon />),
  };

Object.keys(KialiIcon).forEach(key => {
  KialiIcon[key].defaultProps = {
    className: iconStyle,
  };
});

// createTooltipIcon wraps the icon in a span element. Tooltip child elements that are
// SVGs (icons) need to be wrapped in something to avoid the tooltip from disappearing on refresh.
// See: https://github.com/kiali/kiali/issues/3583 for more details.
export function createTooltipIcon(icon: any, dataTest?: string) {
  return <span data-test={dataTest}>{icon}</span>;
}

export const createIcon = (
  props: IconProps,
  icon?: React.ComponentClass<SVGIconProps>,
  colorIcon?: string,
): React.ReactElement => {
  const iconComponent = props.icon ?? icon ?? React.Fragment;

  const iconColor = props.color ?? colorIcon;

  const iconStyles = iconColor ? kialiStyle({ color: iconColor }) : undefined;

  return (
    <Icon
      className={classes(props.className, iconStyles)}
      size={props.size}
      data-test={props.dataTest}
    >
      {React.createElement(iconComponent)}
    </Icon>
  );
};

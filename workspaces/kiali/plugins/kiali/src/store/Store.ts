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
import type {
  CertsInfo,
  ComponentStatus,
  ComputedServerConfig,
  JaegerTrace,
  Namespace,
  NotificationGroup,
  RawDate,
  StatusState,
  TimeRange,
  TLSStatus,
  TracingInfo,
  UserName,
} from '@backstage-community/plugin-kiali-common/types';
import { KialiAppAction } from '../actions/KialiAppAction';
import { AlertUtils } from '../utils/Alertutils';

export interface ProviderState {
  activeProvider: string;
  items?: string[];
}

export interface NamespaceState {
  readonly activeNamespaces: Namespace[];
  readonly filter: string;
  readonly items?: Namespace[];
  readonly isFetching: boolean;
  readonly lastUpdated?: Date;
  readonly namespacesPerCluster?: Map<string, string[]>;
}

export interface MessageCenterState {
  nextId: number; // This likely will go away once we have persistence
  groups: NotificationGroup[];
  hidden: boolean;
  expanded: boolean;
  expandedGroupId?: string;
}

export enum LoginStatus {
  logging,
  loggedIn,
  loggedOut,
  error,
  expired,
}

export interface LoginSession {
  expiresOn: RawDate;
  username: UserName;
  kialiCookie: string;
}

export interface LoginState {
  landingRoute?: string;
  message: string;
  session?: LoginSession;
  status: LoginStatus;
}

export interface InterfaceSettings {
  navCollapse: boolean;
}

export interface UserSettings {
  duration: number;
  interface: InterfaceSettings;
  refreshInterval: number;
  replayActive: boolean;
  replayQueryTime: number;
  timeRange: TimeRange;
}

export type TracingState = {
  info?: TracingInfo;
  selectedTrace?: JaegerTrace;
};

export interface ServerConfigState {
  config: ComputedServerConfig;
  isLoaded: boolean;
}

// This defines the Kiali Global Application State
export interface KialiAppState {
  // Global state === across multiple pages
  // could also be session state
  /** Page Settings */
  authentication: LoginState;
  istioStatus: ComponentStatus[];
  istioCertsInfo: CertsInfo[];
  messageCenter: MessageCenterState;
  meshTLSStatus: TLSStatus;
  namespaces: NamespaceState;
  providers: ProviderState;
  statusState: StatusState;
  /** User Settings */
  userSettings: UserSettings;
  tracingState: TracingState;
  serverConfig: ServerConfigState;
  dispatch: { [key: string]: React.Dispatch<KialiAppAction> };
  alertUtils?: AlertUtils;
}

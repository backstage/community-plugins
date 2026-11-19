/*
 * Copyright 2021 The Backstage Authors
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
import { createDevApp } from '@backstage/dev-utils';
import { ilertPlugin } from '../src/plugin';
import { ILertPage } from '../src';
import { ilertApiRef } from '../src/api';
import {
  Alert,
  AlertAction,
  AlertResponder,
  AlertSource,
  EscalationPolicy,
  Schedule,
  Service,
  StatusPage,
  User,
} from '../src/types';

// Mock data for development
const mockSchedules = [
  {
    id: 1,
    name: 'On-Call Schedule',
    description: 'Primary on-call schedule',
    timezone: 'Europe/Berlin',
    currentShift: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 86400000).toISOString(),
      user: {
        id: 1,
        email: 'oncall@example.com',
        firstName: 'On',
        lastName: 'Call',
      },
    },
    nextShift: {
      start: new Date(Date.now() + 86400000).toISOString(),
      end: new Date(Date.now() + 172800000).toISOString(),
      user: {
        id: 2,
        email: 'backup@example.com',
        firstName: 'Back',
        lastName: 'Up',
      },
    },
  },
];

const mockAlerts = [
  {
    id: 1,
    summary: 'High CPU Usage',
    details: 'CPU usage is above 90%',
    reportTime: new Date(Date.now() - 3600000).toISOString(),
    status: 'OPEN',
    priority: 'HIGH',
    alertKey: 'alert-1',
  },
  {
    id: 2,
    summary: 'Database Connection Error',
    details: 'Unable to connect to database',
    reportTime: new Date(Date.now() - 1800000).toISOString(),
    status: 'ACKNOWLEDGED',
    priority: 'CRITICAL',
    alertKey: 'alert-2',
  },
];

createDevApp()
  .registerPlugin(ilertPlugin)
  .registerApi({
    api: ilertApiRef,
    deps: {},
    factory: () =>
      ({
        fetchOnCallSchedules: async () => mockSchedules,
        fetchAlerts: async () => mockAlerts,
        fetchAlertsCount: async () => mockAlerts.length,
        fetchAlert: async (id: number) => mockAlerts.find(a => a.id === id),
        fetchAlertResponders: async () => [] as AlertResponder[],
        fetchAlertActions: async () => [] as AlertAction[],
        acceptAlert: async (alert: Alert) => alert,
        resolveAlert: async (alert: Alert) => alert,
        assignAlert: async (alert: Alert) => alert,
        createAlert: async () => true,
        triggerAlertAction: async () => {},
        fetchAlertSources: async () => [] as AlertSource[],
        fetchAlertSource: async () => null as any,
        fetchAlertSourceOnCalls: async () => [],
        enableAlertSource: async (source: AlertSource) => source,
        disableAlertSource: async (source: AlertSource) => source,
        addImmediateMaintenance: async () => {},
        fetchUsers: async () => [] as User[],
        overrideShift: async (
          _scheduleId: number,
          _userId: number,
          _start: string,
          _end: string,
        ) => mockSchedules[0],
        fetchServices: async () => [] as Service[],
        fetchStatusPages: async () => [] as StatusPage[],
        getAlertDetailsURL: (alert: Alert) =>
          `https://app.ilert.com/alerts/${alert.id}`,
        getAlertSourceDetailsURL: (alertSource: AlertSource | null) =>
          alertSource
            ? `https://app.ilert.com/alert-sources/${alertSource.id}`
            : '',
        getEscalationPolicyDetailsURL: (escalationPolicy: EscalationPolicy) =>
          `https://app.ilert.com/escalation-policies/${escalationPolicy.id}`,
        getScheduleDetailsURL: (schedule: Schedule) =>
          `https://app.ilert.com/schedules/${schedule.id}`,
        getServiceDetailsURL: (service: Service) =>
          `https://app.ilert.com/services/${service.id}`,
        getStatusPageDetailsURL: (statusPage: StatusPage) =>
          `https://app.ilert.com/status-pages/${statusPage.id}`,
        getStatusPageURL: (statusPage: StatusPage) =>
          `https://app.ilert.com/status-pages/${statusPage.id}`,
        getUserPhoneNumber: (user: User | null) => user?.mobile?.number || '',
        getUserInitials: (user: User | null) =>
          user
            ? `${user.firstName?.[0] || ''}${
                user.lastName?.[0] || ''
              }`.toUpperCase()
            : '',
      } as any),
  })
  .addPage({
    element: <ILertPage />,
    title: 'iLert Plugin Demo',
  })
  .render();

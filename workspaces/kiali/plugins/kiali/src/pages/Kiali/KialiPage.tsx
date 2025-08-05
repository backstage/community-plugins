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
import { Content, Page } from '@backstage/core-components';
import { default as React } from 'react';
import { AppListPage } from '../AppList/AppListPage';
import { IstioConfigListPage } from '../IstioConfigList/IstioConfigListPage';
import { OverviewPage } from '../Overview/OverviewPage';
import { ServiceListPage } from '../ServiceList/ServiceListPage';
import TrafficGraphPage from '../TrafficGraph/TrafficGraphPage';
import { WorkloadListPage } from '../WorkloadList/WorkloadListPage';
import { KialiHeader } from './Header/KialiHeader';
import { KialiTabs } from './Header/KialiTabs';
import { KialiNoPath } from './NoPath';

const noPath = 'noPath';
const getPathPage = () => {
  const pathname = window.location.pathname.split('/').pop();
  if (pathname && pathname === 'kiali') {
    return 'overview';
  } else if (pathname) {
    return pathname;
  }
  return noPath;
};

export const KialiPage = () => {
  const [selectedTab, _] = React.useState<string>(getPathPage());
  const renderPath = () => {
    switch (selectedTab) {
      case 'overview':
        return <OverviewPage />;
      case 'workloads':
        return <WorkloadListPage />;
      case 'services':
        return <ServiceListPage />;
      case 'applications':
        return <AppListPage />;
      case 'istio':
        return <IstioConfigListPage />;
      case 'graph':
        return <TrafficGraphPage />;
      default:
        return <KialiNoPath />;
    }
  };

  return (
    <Page themeId="app">
      <Content>
        <KialiHeader />
        <KialiTabs />
        {renderPath()}
      </Content>
    </Page>
  );
};

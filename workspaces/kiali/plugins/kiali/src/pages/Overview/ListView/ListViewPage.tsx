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
import { ENTITY } from '@backstage-community/plugin-kiali-common/types';
import { Entity } from '@backstage/catalog-model';
import { CardTab, TabbedCard } from '@backstage/core-components';
import { default as React } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppListPage } from '../../AppList/AppListPage';
import { ServiceListPage } from '../../ServiceList/ServiceListPage';
import { WorkloadListPage } from '../../WorkloadList/WorkloadListPage';

export const ListViewPage = (props: { entity: Entity }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tabresources');
  const [tab, setTab] = React.useState<string>(tabParam || 'workloads');
  const updateTab = (tabvalue: string) => {
    setTab(tabvalue);
    setSearchParams({ ['tabresources']: tabvalue });
  };
  const tabStyle: React.CSSProperties = {
    height: '350px',
    overflowY: 'scroll',
  };

  const cardStyle: React.CSSProperties = {
    marginRight: '20px',
  };
  return (
    <div style={cardStyle}>
      <TabbedCard value={tab} title="Resources">
        <CardTab
          value="workloads"
          onClick={() => updateTab('workloads')}
          label="Workloads"
        >
          <div style={tabStyle}>
            <WorkloadListPage view={ENTITY} entity={props.entity} />
          </div>
        </CardTab>
        <CardTab
          value="services"
          onClick={() => updateTab('services')}
          label="Services"
        >
          <div style={tabStyle}>
            <ServiceListPage view={ENTITY} entity={props.entity} />
          </div>
        </CardTab>
        <CardTab
          value="applications"
          onClick={() => updateTab('applications')}
          label="Applications"
        >
          <div style={tabStyle}>
            <AppListPage view={ENTITY} entity={props.entity} />
          </div>
        </CardTab>
      </TabbedCard>
    </div>
  );
};

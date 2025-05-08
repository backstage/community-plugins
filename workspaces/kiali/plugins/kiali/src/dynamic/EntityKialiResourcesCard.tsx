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
import { DRAWER } from '@backstage-community/plugin-kiali-common/types';
import {
  CardTab,
  CodeSnippet,
  EmptyState,
  TabbedCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box } from '@material-ui/core';
import { default as React, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppListPage } from '../pages/AppList/AppListPage';
import { ServiceListPage } from '../pages/ServiceList/ServiceListPage';
import { WorkloadListPage } from '../pages/WorkloadList/WorkloadListPage';
import { KialiProvider } from '../store/KialiProvider';

const tabStyle: React.CSSProperties = {
  maxHeight: '400px',
};

const tabs = ['workload', 'service', 'application'];

export const EntityKialiResourcesCard = () => {
  const { entity } = useEntity();
  const location = useLocation();
  const [element, setElement] = React.useState<string>();
  const prevElement = useRef(element);
  const [renderCount, setRenderCount] = React.useState(0);

  const getInitValue = (): string => {
    const hash = location.hash.replace(/^#,?\s*/, '');
    const data = hash.split('/');

    if (data.length > 1 && data[1] !== element) {
      setElement(data[1]);
    }
    if (tabs.includes(data[0])) {
      return data[0];
    }
    return tabs[0];
  };
  const [value, setValue] = React.useState<string | number>(getInitValue());

  const navigate = useNavigate();

  const handleChange = (
    _: React.ChangeEvent<{}>,
    newValue: string | number,
  ) => {
    setValue(newValue);
    navigate(`#${newValue}`);
  };

  React.useEffect(() => {
    // This time out is needed to have rendered the context and be able to call the element to open the drawer
    const timeout = setTimeout(() => {
      setRenderCount(prevCount => prevCount + 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  React.useEffect(() => {
    const hash = location.hash.replace(/^#,?\s*/, '');
    const data = hash.split('/');
    if (data.length > 0) {
      const val = data[0];
      if (val !== value) {
        setValue(val);
        setTimeout(() => {
          setRenderCount(prevCount => prevCount + 1);
        }, 1000);
      }
    }
  }, [location.hash, value]);

  React.useEffect(() => {
    if (element && element !== prevElement.current && renderCount > 0) {
      setTimeout(() => {
        const drawer = document.getElementById(`drawer_${element}`);
        if (drawer) {
          drawer.click();
        }
        prevElement.current = element;
      }, 1000);
    }
  }, [element, renderCount]);
  return !entity ? (
    <EmptyState
      missing="data"
      title="No resources to show with these annotations"
      description={
        <>
          Kiali detected the annotations
          <div style={{ marginTop: '40px' }}>
            This is the entity loaded.
            <Box style={{ marginTop: '10px' }}>
              <CodeSnippet
                text={JSON.stringify(entity, null, 2)}
                language="yaml"
                showLineNumbers
                customStyle={{ background: 'inherit', fontSize: '115%' }}
              />
            </Box>
          </div>
        </>
      }
    />
  ) : (
    <KialiProvider>
      <TabbedCard
        title="Service Mesh Resources"
        onChange={handleChange}
        value={value}
        data-test="kiali-tabbed-card"
      >
        <CardTab label="Workloads" value="workload" data-test="workloads-tab">
          <div style={tabStyle}>
            <WorkloadListPage view={DRAWER} entity={entity} />
          </div>
        </CardTab>
        <CardTab label="Services" value="service" data-test="services-tab">
          <div style={tabStyle}>
            <ServiceListPage view={DRAWER} entity={entity} />
          </div>
        </CardTab>
        <CardTab label="Applications" value="application" data-test="apps-tab">
          <div style={tabStyle}>
            <AppListPage view={DRAWER} entity={entity} />
          </div>
        </CardTab>
      </TabbedCard>
    </KialiProvider>
  );
};

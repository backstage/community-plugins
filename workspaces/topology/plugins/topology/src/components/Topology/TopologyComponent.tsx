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
import { useLayoutEffect } from 'react';

import { useTheme } from '@mui/material/styles';

import { FilterContext } from '../../hooks/FilterContext';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import { useFilterContextValues } from '../../hooks/useFilterContextValues';
import { useK8sObjectsResponse } from '../../hooks/useK8sObjectsResponse';
import { ModelsPlural } from '../../models';
import { ModelsPlural as TektonModels } from '../../pipeline-models';
import { TopologyWorkloadView } from './TopologyWorkloadView';

import '@patternfly/react-core/dist/styles/base-no-reset.css';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import './TopologyComponent.css';
import { RequireKubernetesReadPermissions } from './permissions/requireKubernetesReadPermissions';

const THEME_DARK = 'dark';
const THEME_DARK_CLASS = 'pf-v6-theme-dark';

const savedStylesheets = new Set<HTMLLinkElement>();
const firstLinkOrScript = document.head.querySelector('link, script');

export const TopologyComponent = () => {
  const {
    palette: { mode },
  } = useTheme();
  useLayoutEffect(() => {
    const htmlTagElement = document.documentElement;

    const scalprumStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).filter(link =>
      link.attributes
        .getNamedItem('href')
        ?.value?.includes('backstage-community.plugin-topology'),
    );

    scalprumStyles.forEach(link =>
      savedStylesheets.add(link as HTMLLinkElement),
    );

    savedStylesheets.forEach(link => {
      if (!document.head.contains(link)) {
        if (firstLinkOrScript) {
          document.head.insertBefore(link, firstLinkOrScript);
        } else {
          document.head.insertBefore(link, document.head.firstChild);
        }
      }
    });

    if (mode === THEME_DARK) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }

    return () => {
      savedStylesheets.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });

      if (htmlTagElement.classList.contains(THEME_DARK_CLASS)) {
        htmlTagElement.classList.remove(THEME_DARK_CLASS);
      }
    };
  }, [mode]);

  const watchedResources = [
    ModelsPlural.deployments,
    ModelsPlural.pods,
    ModelsPlural.services,
    ModelsPlural.replicasets,
    ModelsPlural.ingresses,
    ModelsPlural.daemonsets,
    ModelsPlural.statefulsets,
    ModelsPlural.cronjobs,
    ModelsPlural.jobs,
    ModelsPlural.routes,
    TektonModels.taskruns,
    TektonModels.pipelineruns,
    TektonModels.pipelines,
    ModelsPlural.checlusters,
    ModelsPlural.virtualmachines,
    ModelsPlural.virtualmachineinstances,
  ];

  const k8sResourcesContextData = useK8sObjectsResponse(watchedResources);
  const filterContextData = useFilterContextValues();

  return (
    <RequireKubernetesReadPermissions>
      <K8sResourcesContext.Provider value={k8sResourcesContextData}>
        <FilterContext.Provider value={filterContextData}>
          <div className="pf-ri__topology">
            <TopologyWorkloadView />
          </div>
        </FilterContext.Provider>
      </K8sResourcesContext.Provider>
    </RequireKubernetesReadPermissions>
  );
};

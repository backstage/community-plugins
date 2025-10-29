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

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { useTektonObjectsResponse } from '../../hooks/useTektonObjectsResponse';
import { useTektonViewPermission } from '../../hooks/useTektonViewPermission';
import { ModelsPlural } from '../../models';
import PermissionAlert from '../common/PermissionAlert';
import PipelineRunList from '../PipelineRunList/PipelineRunList';

import '@patternfly/react-core/dist/styles/base-no-reset.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import { Progress } from '@backstage/core-components';

const savedStylesheets = new Set<HTMLLinkElement>();

export const TektonCIComponent = () => {
  useDarkTheme();

  useLayoutEffect(() => {
    const scalprumStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).filter(link =>
      link.attributes
        .getNamedItem('href')
        ?.value?.includes('backstage-plugin-tekton'),
    );

    scalprumStyles.forEach(link =>
      savedStylesheets.add(link as HTMLLinkElement),
    );

    savedStylesheets.forEach(link => {
      if (!document.head.contains(link)) {
        document.head.appendChild(link);
      }
    });
    return () => {
      savedStylesheets.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  const watchedResources = [
    ModelsPlural.pipelineruns,
    ModelsPlural.taskruns,
    ModelsPlural.pods,
  ];
  const tektonResourcesContextData = useTektonObjectsResponse(watchedResources);
  const viewPermissionData = useTektonViewPermission();

  if (viewPermissionData.loading) {
    return (
      <div data-testid="tekton-permission-progress">
        <Progress />
      </div>
    );
  }
  if (!viewPermissionData.allowed) {
    return <PermissionAlert />;
  }
  return (
    <TektonResourcesContext.Provider value={tektonResourcesContextData}>
      <PipelineRunList />
    </TektonResourcesContext.Provider>
  );
};

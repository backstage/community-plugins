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
import React, { createContext, ReactNode } from 'react';

import { useArgocdRollouts } from '../../../../hooks/useArgoRollouts';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';
import { RolloutUI } from '../../../../types/revision';
import { getRolloutUIResources } from '../../../../utils/rollout-utils';
import { ArgoResources } from '../../../../types/resources';

interface ArgoResourcesContextProps {
  rollouts: RolloutUI[];
  argoResources: ArgoResources;
}

export const ArgoResourcesContext = createContext<ArgoResourcesContextProps>(
  undefined as any,
);

export const ArgoResourcesProvider: React.FC<{
  application: Application | undefined;
  children: ReactNode;
}> = ({ application, children }) => {
  const argoResources = useArgocdRollouts();
  const applicationName = application?.metadata?.name;
  const rollouts = getRolloutUIResources(argoResources, applicationName);

  return (
    <ArgoResourcesContext.Provider
      value={{
        rollouts,
        argoResources,
      }}
    >
      {children}
    </ArgoResourcesContext.Provider>
  );
};

export const useArgoResources = () => {
  const context = React.useContext(ArgoResourcesContext);
  if (!context) {
    throw new Error(
      'useArgoResources must be used within an ArgoResourcesProvider',
    );
  }
  return context;
};

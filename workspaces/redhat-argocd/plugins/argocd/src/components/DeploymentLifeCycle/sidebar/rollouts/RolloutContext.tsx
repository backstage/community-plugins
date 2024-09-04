import React, { createContext, ReactNode } from 'react';

import { useArgocdRollouts } from '../../../../hooks/useArgoRollouts';
import { Application } from '../../../../types/application';
import { RolloutUI } from '../../../../types/revision';
import { getRolloutUIResources } from '../../../../utils/rollout-utils';

interface ArgoResourcesContextProps {
  rollouts: RolloutUI[];
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

import React from 'react';

import { AzureContainerRegistry } from '../AzureContainerRegistry';
import { useAcrAppData } from '../useAcrAppData';

export const AcrDashboardPage = () => {
  const { imageName } = useAcrAppData();

  return <AzureContainerRegistry image={imageName} />;
};

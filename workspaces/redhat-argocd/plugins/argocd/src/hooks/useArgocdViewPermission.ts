import { usePermission } from '@backstage/plugin-permission-react';

import { argocdViewPermission } from '@backstage-community/plugin-redhat-argocd-common';

export const useArgocdViewPermission = () => {
  const argocdViewPermissionResult = usePermission({
    permission: argocdViewPermission,
  });

  return argocdViewPermissionResult.allowed;
};

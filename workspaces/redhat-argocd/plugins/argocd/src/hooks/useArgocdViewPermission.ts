import { usePermission } from '@backstage/plugin-permission-react';

import { argocdViewPermission } from '@janus-idp/backstage-plugin-argocd-common';

export const useArgocdViewPermission = () => {
  const argocdViewPermissionResult = usePermission({
    permission: argocdViewPermission,
  });

  return argocdViewPermissionResult.allowed;
};

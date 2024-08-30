import React from 'react';

import { Alert, AlertTitle } from '@material-ui/lab';

const PermissionAlert = () => {
  return (
    <Alert severity="warning" data-testid="no-permission-alert">
      <AlertTitle>Permission required</AlertTitle>
      To view argocd plugin, contact your administrator to give you the
      argocd.view.read permission.
    </Alert>
  );
};
export default PermissionAlert;

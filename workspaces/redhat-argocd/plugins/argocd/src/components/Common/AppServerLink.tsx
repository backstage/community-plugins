import * as React from 'react';
import { Application } from '../../types/application';
import { Tooltip } from '@material-ui/core';

interface AppServerLinkProps {
  application: Application;
}

const AppServerLink: React.FC<AppServerLinkProps> = ({ application }) => {
  if (!application) {
    return null;
  }
  return (
    <span style={{ wordBreak: 'break-word' }}>
      {application?.spec?.destination?.server}{' '}
      {application?.spec?.destination?.server ===
      'https://kubernetes.default.svc' ? (
        <Tooltip
          title="This is the local cluster where Argo CD is installed."
          data-testid="local-cluster-tooltip"
        >
          <span>(in-cluster) </span>
        </Tooltip>
      ) : (
        ''
      )}
    </span>
  );
};

export default AppServerLink;

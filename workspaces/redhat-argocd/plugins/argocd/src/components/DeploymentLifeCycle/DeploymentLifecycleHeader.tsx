import React from 'react';

import { IconButton } from '@material-ui/core';
import ExternalLinkIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { useArgocdConfig } from '../../hooks/useArgocdConfig';
import { Application } from '../../types';

const DeploymentLifecycleHeader: React.FC<{ app: Application }> = ({ app }) => {
  const { instances, baseUrl } = useArgocdConfig();

  const supportsMultipleArgoInstances = !!instances.length;
  const getBaseUrl = (row: Application): string | undefined => {
    if (supportsMultipleArgoInstances && !baseUrl) {
      return instances?.find(
        value => value?.name === row.metadata?.instance?.name,
      )?.url;
    }
    return baseUrl;
  };
  return (
    <>
      {app.metadata.name}{' '}
      <IconButton
        data-testid={`${app.metadata.name}-link`}
        color="primary"
        size="small"
        target="_blank"
        href={`${getBaseUrl(app)}/applications/${app.metadata.name}`}
        onClick={e => e.stopPropagation()}
      >
        <ExternalLinkIcon />
      </IconButton>
    </>
  );
};

export default DeploymentLifecycleHeader;

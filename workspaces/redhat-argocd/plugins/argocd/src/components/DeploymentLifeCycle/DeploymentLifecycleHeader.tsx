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
import type { FC } from 'react';

import { IconButton } from '@material-ui/core';
import ExternalLinkIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { useArgocdConfig } from '../../hooks/useArgocdConfig';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';

const DeploymentLifecycleHeader: FC<{ app: Application }> = ({ app }) => {
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

  const appUrl = app?.metadata?.namespace
    ? `${getBaseUrl(app)}/applications/${app.metadata.namespace}/${
        app.metadata.name
      }`
    : `${getBaseUrl(app)}/applications/${app.metadata.name}`;

  return (
    <>
      {app.metadata.name}{' '}
      <IconButton
        data-testid={`${app.metadata.name}-link`}
        color="primary"
        size="small"
        target="_blank"
        href={appUrl}
        onClick={e => e.stopPropagation()}
      >
        <ExternalLinkIcon />
      </IconButton>
    </>
  );
};

export default DeploymentLifecycleHeader;

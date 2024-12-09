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
import React from 'react';

import { WarningPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Typography } from '@material-ui/core';

import { ClusterError, ClusterErrors } from '../../types/types';

type ErrorPanelProps = { allErrors: ClusterErrors };

export const ErrorPanel = ({ allErrors }: ErrorPanelProps) => {
  const {
    entity: {
      metadata: { name: entityName },
    },
  } = useEntity();
  return (
    <div className="warning-panel" style={{ marginBottom: '16px' }}>
      <WarningPanel
        title="There was a problem retrieving Kubernetes objects"
        message={`There was a problem retrieving some Kubernetes resources for the entity: ${entityName}. This could mean that the Error Reporting card is not completely accurate.`}
      >
        <div>
          Errors:
          {allErrors.map((err: ClusterError, _index) => {
            const errMessage = err.message
              ? `${err.message}`
              : `Error fetching Kubernetes resource: '${err.resourcePath}', error: ${err.errorType}, status code: ${err.statusCode}`;
            return (
              <Typography
                variant="body2"
                key={`${err.resourcePath}-${err.statusCode}`}
              >
                {err.errorType === 'FETCH_ERROR'
                  ? `Error communicating with Kubernetes: ${err.errorType}, message: ${err.message}`
                  : errMessage}
              </Typography>
            );
          })}
        </div>
      </WarningPanel>
    </div>
  );
};

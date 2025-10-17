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
import Typography from '@mui/material/Typography';
import { Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import ResourceName from '../../common/ResourceName';
import { resourceModels } from '../../../models';
import { K8sWorkloadResource } from '../../../types/types';

import './TopologySideBarHeading.css';

type TopologySideBarHeadingProps = { resource: K8sWorkloadResource };

const TopologySideBarHeading = ({ resource }: TopologySideBarHeadingProps) => {
  const resourceName = resource.metadata?.name;
  const resourceKind = resource.kind ?? '';
  return (
    <Stack className="topology-side-bar-heading">
      <StackItem>
        <Split className="topology-side-bar-heading-label">
          {resourceModels[resourceKind] ? (
            <SplitItem
              style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }}
            >
              <ResourceName
                kind={resourceKind}
                name={resourceName ?? ''}
                large
              />
            </SplitItem>
          ) : (
            <SplitItem>
              <Typography variant="h6">{resourceName}</Typography>
            </SplitItem>
          )}
        </Split>
      </StackItem>
      {!resourceModels[resourceKind] && (
        <StackItem>
          <Typography color="textSecondary" variant="body1">
            {resourceKind}
          </Typography>
        </StackItem>
      )}
    </Stack>
  );
};

export default TopologySideBarHeading;

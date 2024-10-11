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
import * as React from 'react';

import { V1OwnerReference } from '@kubernetes/client-node';
import { Timestamp, TimestampFormat } from '@patternfly/react-core';

import { K8sWorkloadResource } from '../../../types/types';
import TopologyResourceLabels from './TopologyResourceLabels';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';

const TopologyWorkloadDetails = ({
  resource,
  children,
}: React.PropsWithChildren<{ resource: K8sWorkloadResource }>) => {
  return (
    <dl>
      <TopologySideBarDetailsItem label="Name">
        {resource.metadata?.name}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Namespace">
        {resource.metadata?.namespace}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Labels" emptyText="No labels">
        {resource.metadata?.labels && (
          <TopologyResourceLabels
            labels={resource.metadata.labels}
            dataTest="label-list"
          />
        )}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem
        label="Annotations"
        emptyText="No annotations"
      >
        {resource.metadata?.annotations && (
          <TopologyResourceLabels
            labels={resource.metadata.annotations}
            dataTest="annotation-list"
          />
        )}
      </TopologySideBarDetailsItem>
      {children}
      <TopologySideBarDetailsItem label="Created at">
        <Timestamp
          date={resource.metadata?.creationTimestamp}
          dateFormat={TimestampFormat.medium}
          timeFormat={TimestampFormat.short}
        />
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Owner" emptyText="No owner">
        {resource.metadata?.ownerReferences && (
          <ul data-testid="owner-list">
            <div>
              {(resource.metadata.ownerReferences ?? []).map(
                (o: V1OwnerReference) => (
                  <li key={o.uid}>{o.name}</li>
                ),
              )}
            </div>
          </ul>
        )}
      </TopologySideBarDetailsItem>
    </dl>
  );
};

export default TopologyWorkloadDetails;

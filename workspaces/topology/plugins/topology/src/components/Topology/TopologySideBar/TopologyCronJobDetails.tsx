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

import { V1CronJob } from '@kubernetes/client-node';
import { Timestamp, TimestampFormat } from '@patternfly/react-core';

import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

const TopologyCronJobDetails: FC<{ resource: V1CronJob }> = ({ resource }) => {
  return (
    <TopologyWorkloadDetails resource={resource}>
      <TopologySideBarDetailsItem label="Schedule">
        {resource.spec?.schedule}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Concurrency policy">
        {resource.spec?.concurrencyPolicy}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem
        label="Starting deadline seconds"
        emptyText="Not configured"
      >
        {resource.spec?.startingDeadlineSeconds &&
          (resource.spec.startingDeadlineSeconds > 1
            ? `${resource.spec.startingDeadlineSeconds} seconds`
            : `${resource.spec.startingDeadlineSeconds} second`)}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label="Last schedule time" emptyText="-">
        {resource.status?.lastScheduleTime && (
          <Timestamp
            date={resource.status?.lastScheduleTime}
            dateFormat={TimestampFormat.medium}
            timeFormat={TimestampFormat.short}
          />
        )}
      </TopologySideBarDetailsItem>
    </TopologyWorkloadDetails>
  );
};

export default TopologyCronJobDetails;

/*
 * Copyright 2025 The Backstage Authors
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

import { Avatar, Chip, Grid, Typography } from '@material-ui/core';
import { ServiceDetailsField } from './ServiceDetailsField';
import { EntityPeekAheadPopover } from '@backstage/plugin-catalog-react';
import { Link } from '@backstage/core-components';
import {
  BusinessApplication,
  ServiceNowUser,
} from '../../../../api/cmdb/types';
import Skeleton from '@material-ui/lab/Skeleton/Skeleton';
import { DEFAULT_NAMESPACE } from '@backstage/catalog-model';

export interface ServiceDetailsContentProps {
  details: BusinessApplication;
  owner?: ServiceNowUser;
  delegate?: ServiceNowUser;
  namespace?: string;
}

export const ServiceDetailsContent = ({
  details,
  owner,
  delegate,
  namespace,
}: ServiceDetailsContentProps) => (
  <Grid container spacing={2}>
    <ServiceDetailsField
      label="Application Name"
      gridSizes={{ xs: 12 }}
      value={details.name}
    />

    <ServiceDetailsField label="App Code" gridSizes={{ xs: 12, md: 6 }}>
      <Chip size="medium" label={details.u_application_id} />
    </ServiceDetailsField>

    <ServiceDetailsField
      label="Service Criticality"
      gridSizes={{ xs: 12, md: 6 }}
      value={details.business_criticality}
    />

    <ServiceDetailsField label="Service Owner" gridSizes={{ xs: 12, md: 6 }}>
      {!owner ? (
        <Skeleton animation="wave" width="80%" height={32} />
      ) : (
        <EntityPeekAheadPopover
          entityRef={`user:${namespace ?? DEFAULT_NAMESPACE}/${
            owner.user_name
          }`}
        >
          <Chip
            variant="outlined"
            label={owner.name}
            avatar={<Avatar alt={owner.name} src="#" />}
          />
        </EntityPeekAheadPopover>
      )}
    </ServiceDetailsField>

    <ServiceDetailsField label="Delegate" gridSizes={{ xs: 12, md: 6 }}>
      {!delegate ? (
        <Skeleton animation="wave" width="80%" height={32} />
      ) : (
        <EntityPeekAheadPopover
          entityRef={`user:${namespace ?? DEFAULT_NAMESPACE}/${
            delegate.user_name
          }`}
        >
          <Chip
            variant="outlined"
            label={delegate.name}
            avatar={<Avatar alt={delegate.name} src="#" />}
          />
        </EntityPeekAheadPopover>
      )}
    </ServiceDetailsField>

    <ServiceDetailsField label="Support Contact Email" gridSizes={{ xs: 12 }}>
      <Link
        to={`mailto:${details.u_support_contact_email}`}
        target="_blank"
        rel="noopener"
      >
        <Typography variant="body1">
          {details.u_support_contact_email}
        </Typography>
      </Link>
    </ServiceDetailsField>
  </Grid>
);

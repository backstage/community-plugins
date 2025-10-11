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

import { useMemo } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  EmptyState,
  InfoCard,
  InfoCardVariants,
} from '@backstage/core-components';
import { ServiceDetailsContent } from './ServiceDetailsContent';
import { getAppCodeFromEntity } from '../../utils/getAppCodeFromEntity';
import { useServiceDetails } from '../../hooks';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { getServiceNowFormUrl } from '../../utils/getServiceNowFormUrl';
import { CardSkeleton } from '../CardSkeleton';
import { useServiceUser } from '../../hooks/useServiceUser';
import { iff } from '../../utils/ternaryConditional';

export interface Props {
  variant?: InfoCardVariants;
}

export const ServiceDetailsCard = (props: Props) => {
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const serviceNowHost = configApi.getOptionalString('cmdb.host');
  const userNamespace = configApi.getOptionalString('cmdb.userNamespace');
  const appCode = getAppCodeFromEntity(entity);

  const { loading, serviceDetails } = useServiceDetails(appCode);

  const { userInfo: owner } = useServiceUser(serviceDetails?.owned_by?.value);
  const { userInfo: delegate } = useServiceUser(
    serviceDetails?.u_delegate?.value,
  );

  const serviceDashboardUrl = useMemo(() => {
    if (!serviceNowHost) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return {
      link: getServiceNowFormUrl(serviceNowHost, appCode),
      title: 'View on ServiceNow',
    };
  }, [appCode, serviceNowHost]);

  return (
    <InfoCard
      title="CMDB Details"
      variant={props.variant}
      deepLink={serviceDashboardUrl}
    >
      {loading ? (
        <CardSkeleton />
      ) : (
        iff(
          !serviceDetails || Object.keys(serviceDetails).length === 0,
          <EmptyState
            missing="field"
            title="Application not found"
            description="Looks like the appcode might be incorrect!"
          />,
          <ServiceDetailsContent
            details={serviceDetails}
            owner={owner}
            delegate={delegate}
            namespace={userNamespace}
          />,
        )
      )}
    </InfoCard>
  );
};

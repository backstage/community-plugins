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
import type {
  ServiceDetailsInfo,
  Validations,
} from '@backstage-community/plugin-kiali-common/types';
import { DRAWER } from '@backstage-community/plugin-kiali-common/types';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress } from '@material-ui/core';
import { default as React } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import { HistoryManager } from '../../app/History';
import { ServiceInfo } from '../../pages/ServiceDetails/ServiceInfo';
import { kialiApiRef } from '../../services/Api';

type Props = {
  namespace: string;
  service: string;
};
export const ServiceDetailsDrawer = (props: Props) => {
  const kialiClient = useApi(kialiApiRef);
  const [serviceItem, setServiceItem] = React.useState<ServiceDetailsInfo>();
  const cluster = HistoryManager.getClusterName();
  const [validations, setValidations] = React.useState<Validations>({});

  const fetchService = async () => {
    kialiClient
      .getServiceDetail(props.namespace, props.service, true, cluster, 60)
      .then((serviceResponse: ServiceDetailsInfo) => {
        setServiceItem(serviceResponse);
        setValidations(serviceResponse.validations);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchService();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      {serviceItem && (
        <ServiceInfo
          service={props.service}
          duration={60}
          namespace={props.namespace}
          validations={validations}
          cluster={cluster}
          serviceDetails={serviceItem}
          gateways={[]}
          k8sGateways={[]}
          peerAuthentications={[]}
          istioAPIEnabled
          view={DRAWER}
        />
      )}
    </>
  );
};

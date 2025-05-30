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
import {
  drToIstioItems,
  gwToIstioItems,
  k8sGwToIstioItems,
  k8sHTTPRouteToIstioItems,
  seToIstioItems,
  validationKey,
  vsToIstioItems,
} from '@backstage-community/plugin-kiali-common/func';
import {
  DRAWER,
  DurationInSeconds,
  ENTITY,
  Gateway,
  K8sGateway,
  ObjectValidation,
  PeerAuthentication,
  ServiceDetailsInfo,
  ServiceId,
  Validations,
} from '@backstage-community/plugin-kiali-common/types';
import { Grid } from '@material-ui/core';
import { IstioConfigCard } from '../../components/IstioConfigCard/IstioConfigCard';
import { ServiceDescription } from './ServiceDescription';
import { ServiceNetwork } from './ServiceNetwork';

interface Props extends ServiceId {
  cluster?: string;
  duration: DurationInSeconds;
  serviceDetails?: ServiceDetailsInfo;
  gateways: Gateway[];
  k8sGateways: K8sGateway[];
  peerAuthentications: PeerAuthentication[];
  validations: Validations;
  istioAPIEnabled: boolean;
  view?: string;
}

export const ServiceInfo = (serviceProps: Props) => {
  const getServiceValidation = (): ObjectValidation | undefined => {
    if (
      serviceProps.validations &&
      serviceProps.validations.service &&
      serviceProps.serviceDetails
    ) {
      return serviceProps.validations.service[
        validationKey(
          serviceProps.serviceDetails.service.name,
          serviceProps.namespace,
        )
      ];
    }
    return undefined;
  };

  const vsIstioConfigItems = serviceProps.serviceDetails?.virtualServices
    ? vsToIstioItems(
        serviceProps.serviceDetails.virtualServices,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const drIstioConfigItems = serviceProps.serviceDetails?.destinationRules
    ? drToIstioItems(
        serviceProps.serviceDetails.destinationRules,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const gwIstioConfigItems =
    serviceProps?.gateways && serviceProps.serviceDetails?.virtualServices
      ? gwToIstioItems(
          serviceProps?.gateways,
          serviceProps.serviceDetails.virtualServices,
          serviceProps.serviceDetails.validations,
          serviceProps.cluster,
        )
      : [];
  const k8sGwIstioConfigItems =
    serviceProps?.k8sGateways &&
    (serviceProps.serviceDetails?.k8sHTTPRoutes ||
      serviceProps.serviceDetails?.k8sGRPCRoutes)
      ? k8sGwToIstioItems(
          serviceProps?.k8sGateways,
          serviceProps.serviceDetails.k8sHTTPRoutes,
          serviceProps.serviceDetails.k8sGRPCRoutes,
          serviceProps.serviceDetails.validations,
          serviceProps.cluster,
          '',
        )
      : [];
  const seIstioConfigItems = serviceProps.serviceDetails?.serviceEntries
    ? seToIstioItems(
        serviceProps.serviceDetails.serviceEntries,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const k8sHTTPRouteIstioConfigItems = serviceProps.serviceDetails
    ?.k8sHTTPRoutes
    ? k8sHTTPRouteToIstioItems(
        serviceProps.serviceDetails.k8sHTTPRoutes,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const istioConfigItems = seIstioConfigItems.concat(
    gwIstioConfigItems.concat(
      k8sGwIstioConfigItems.concat(
        vsIstioConfigItems.concat(
          drIstioConfigItems.concat(k8sHTTPRouteIstioConfigItems),
        ),
      ),
    ),
  );

  const size =
    serviceProps.view === ENTITY || serviceProps.view === DRAWER ? 12 : 4;
  return (
    <>
      {serviceProps.serviceDetails && (
        <Grid container spacing={1} style={{ paddingTop: '20px' }}>
          <Grid key={`Card_${serviceProps.service}`} item xs={size}>
            <ServiceDescription
              namespace={serviceProps.namespace}
              serviceDetails={serviceProps.serviceDetails}
              view={serviceProps.view}
            />
          </Grid>
          {serviceProps.view !== DRAWER && (
            <>
              <Grid key={`Card_${serviceProps.service}`} item xs={4}>
                <ServiceNetwork
                  serviceDetails={serviceProps.serviceDetails}
                  gateways={serviceProps.gateways}
                  validations={getServiceValidation()}
                />
              </Grid>
              <Grid key={`Card_${serviceProps.service}`} item xs={4}>
                <IstioConfigCard
                  name={serviceProps.service}
                  items={istioConfigItems}
                />
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};

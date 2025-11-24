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
  Gateway,
  ObjectCheck,
  ObjectValidation,
  ServiceDetailsInfo,
  VirtualService,
} from '@backstage-community/plugin-kiali-common/types';
import {
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { default as React } from 'react';
import { ValidationList } from '../../components/Validations/ValidationList';
import { KialiIcon } from '../../config/KialiIcon';
import { cardsHeight, kialiStyle } from '../../styles/StyleUtils';

type ServiceNetworkProps = {
  gateways: Gateway[];
  serviceDetails: ServiceDetailsInfo;
  validations?: ObjectValidation;
};

type HostnameInfo = {
  hostname: string;
  fromType: string | undefined;
  fromName: string | undefined;
};

const resourceListStyle = kialiStyle({
  $nest: {
    '& > ul > li > span': {
      float: 'left',
      width: '125px',
      fontWeight: 700,
    },
  },
});

const infoStyle = kialiStyle({
  marginLeft: '0.25rem',
});

export const ServiceNetwork: React.FC<ServiceNetworkProps> = (
  props: ServiceNetworkProps,
) => {
  const getPortChecks = (portId: number): ObjectCheck[] => {
    return props.validations
      ? props.validations.checks.filter(c => c.path === `spec/ports[${portId}]`)
      : [];
  };

  const getPortOver = (portId: number): React.ReactNode => {
    return <ValidationList checks={getPortChecks(portId)} />;
  };

  const hasIssue = (portId: number): boolean => {
    return getPortChecks(portId).length > 0;
  };

  const getHostnames = (virtualServices: VirtualService[]): HostnameInfo[] => {
    const hostnames: HostnameInfo[] = [];

    virtualServices.forEach(vs => {
      vs.spec.hosts?.forEach(host => {
        if (host === '*') {
          vs.spec.gateways?.forEach(vsGatewayName => {
            const vsGateways = props.gateways.filter(gateway => {
              return gateway.metadata.name === vsGatewayName;
            });

            vsGateways.forEach(vsGateway => {
              vsGateway.spec.servers?.forEach(servers => {
                servers.hosts.forEach(hostS => {
                  hostnames.push({
                    hostname: hostS,
                    fromType: vsGateway.kind,
                    fromName: vsGateway.metadata.name,
                  });
                });
              });
            });
          });
        } else {
          hostnames.push({
            hostname: host,
            fromType: vs.kind,
            fromName: vs.metadata.name,
          });
        }
      });
    });

    // If there is a wildcard, then it will display only one, the first match
    for (const hostnameInfo of hostnames) {
      if (hostnameInfo.hostname === '*') {
        return [hostnameInfo];
      }
    }

    return hostnames;
  };

  return (
    <Card id="ServiceNetworkCard" style={{ height: cardsHeight }}>
      <CardHeader title={<Typography variant="h6">Network</Typography>} />
      <CardContent>
        <div key="network-list" className={resourceListStyle}>
          <ul style={{ listStyleType: 'none' }}>
            <li>
              <span>Type</span>
              {props.serviceDetails.service?.type}
            </li>

            {props.serviceDetails.service &&
              props.serviceDetails.service?.type !== 'External' && (
                <li>
                  <span>
                    {props.serviceDetails.service.type !== 'ExternalName'
                      ? 'Service IP'
                      : 'ExternalName'}
                  </span>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {props.serviceDetails.service.type !== 'ExternalName'
                    ? props.serviceDetails.service.ip
                      ? props.serviceDetails.service.ip
                      : ''
                    : props.serviceDetails.service.externalName
                    ? props.serviceDetails.service.externalName
                    : ''}
                </li>
              )}

            {props.serviceDetails.endpoints &&
              props.serviceDetails.endpoints.length > 0 && (
                <li>
                  <span>Endpoints</span>
                  <div style={{ display: 'inline-block' }}>
                    {(props.serviceDetails.endpoints ?? []).map(
                      (endpoint, i) => {
                        return (endpoint.addresses ?? []).map((address, u) => (
                          <div key={`endpoint_${i}_address_${u}`}>
                            {address.name !== '' ? (
                              <Tooltip
                                title={
                                  <div style={{ textAlign: 'left' }}>
                                    {address.kind}: {address.name}
                                  </div>
                                }
                              >
                                <span>
                                  {address.ip}{' '}
                                  <KialiIcon.Info className={infoStyle} />
                                </span>
                              </Tooltip>
                            ) : (
                              <>{address.name}</>
                            )}
                          </div>
                        ));
                      },
                    )}
                  </div>
                </li>
              )}

            {props.serviceDetails.service &&
              props.serviceDetails.service.ports &&
              props.serviceDetails.service.ports.length > 0 && (
                <li>
                  <span>Ports</span>
                  <div style={{ display: 'inline-block' }}>
                    {(props.serviceDetails.service.ports ?? []).map(
                      (port, i) => {
                        return (
                          <div key={`port_${i}`}>
                            <div>
                              <span style={{ marginRight: '0.5rem' }}>
                                {port.name} {port.port}
                              </span>
                              {hasIssue(i) ? getPortOver(i) : undefined}
                              {port.appProtocol && port.appProtocol !== '' ? (
                                <Tooltip
                                  title={
                                    <div style={{ textAlign: 'left' }}>
                                      App Protocol: {port.appProtocol}
                                    </div>
                                  }
                                >
                                  <span style={{ marginRight: '0.25rem' }}>
                                    <KialiIcon.Info className={infoStyle} />
                                  </span>
                                </Tooltip>
                              ) : undefined}
                            </div>
                            <div>({port.protocol})</div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </li>
              )}

            {props.serviceDetails.virtualServices?.length > 0 && (
              <li>
                <span>Hostnames</span>
                <div
                  style={{
                    display: 'inline-block',
                    width: '75%',
                  }}
                >
                  {getHostnames(props.serviceDetails.virtualServices).map(
                    (hostname, i) => {
                      return (
                        <div key={`hostname_${i}`}>
                          <Tooltip
                            title={
                              <div style={{ textAlign: 'left' }}>
                                {hostname.fromType} {hostname.fromName}:{' '}
                                {hostname.hostname}
                              </div>
                            }
                          >
                            <div style={{ display: 'flex' }}>
                              <span
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {hostname.hostname}
                              </span>
                              <span>
                                <KialiIcon.Info className={infoStyle} />
                              </span>
                            </div>
                          </Tooltip>
                        </div>
                      );
                    },
                  )}
                </div>
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

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
  DRAWER,
  ObjectReference,
  ServiceReference,
  WorkloadReference,
} from '@backstage-community/plugin-kiali-common/types';
import { List, ListItem, Typography } from '@material-ui/core';
import { default as React } from 'react';
import { ReferenceIstioObjectLink } from '../../components/Link/IstioObjectLink';
import { ServiceLink } from '../../components/Link/ServiceLink';
import { WorkloadLink } from '../../components/Link/WorkloadLink';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { GVKToBadge } from '../../components/VirtualList/Config';
import { getGVKTypeString } from '../../utils/IstioConfigUtils';

interface IstioConfigReferencesProps {
  objectReferences: ObjectReference[];
  serviceReferences: ServiceReference[];
  workloadReferences: WorkloadReference[];
  isValid: boolean | undefined;
  cluster?: string;
  view?: string;
}

export const IstioConfigReferences = (props: IstioConfigReferencesProps) => {
  const objectReferencesExists = (): boolean => {
    if (props.objectReferences && props.objectReferences.length > 0) {
      return true;
    }
    return false;
  };

  const serviceReferencesExists = (): boolean => {
    if (props.serviceReferences && props.serviceReferences.length > 0) {
      return true;
    }
    return false;
  };

  const workloadReferencesExists = (): boolean => {
    if (props.workloadReferences && props.workloadReferences.length > 0) {
      return true;
    }
    return false;
  };

  const renderServiceItem = (
    namespace: string,
    serviceName: string,
  ): React.ReactNode => {
    let link: React.ReactNode;

    if (props.view === DRAWER) {
      link = (
        <>
          <PFBadge badge={PFBadges.Service} />
          <Typography component="span" style={{ marginLeft: 8 }}>
            {serviceName}
          </Typography>
        </>
      );
    } else {
      link = (
        <ServiceLink
          name={serviceName}
          namespace={namespace}
          cluster={props.cluster}
        />
      );
    }

    return link;
  };

  const renderWorkloadItem = (
    namespace: string,
    workloadName: string,
  ): React.ReactNode => {
    let link: React.ReactNode;

    if (props.view === DRAWER) {
      link = (
        <>
          <PFBadge badge={PFBadges.Workload} />
          <Typography component="span" style={{ marginLeft: 8 }}>
            {workloadName}
          </Typography>
        </>
      );
    } else {
      link = (
        <WorkloadLink
          name={workloadName}
          namespace={namespace}
          cluster={props.cluster}
        />
      );
    }

    return link;
  };

  const renderIstioObjectItem = (
    namespace: string,
    name: string,
    objectGVK: any,
  ): React.ReactNode => {
    let link: React.ReactNode;

    if (props.view === DRAWER) {
      const badge = GVKToBadge[getGVKTypeString(objectGVK)];
      link = (
        <>
          <PFBadge badge={badge} />
          <Typography component="span" style={{ marginLeft: 8 }}>
            {name}
          </Typography>
        </>
      );
    } else {
      link = (
        <ReferenceIstioObjectLink
          name={name}
          namespace={namespace}
          objectGVK={objectGVK}
          cluster={props.cluster}
        />
      );
    }

    return link;
  };

  return (
    <>
      <Typography variant="h6" gutterBottom style={{ marginTop: 10 }}>
        References
      </Typography>

      {!objectReferencesExists() &&
        !serviceReferencesExists() &&
        !workloadReferencesExists() && (
          <>No references found for this object.</>
        )}

      {serviceReferencesExists() &&
        props.serviceReferences.map((reference, sRef) => {
          return (
            <List style={{ padding: 0 }}>
              <ListItem key={sRef} style={{ padding: 0 }}>
                {renderServiceItem(reference.namespace, reference.name)}
              </ListItem>
            </List>
          );
        })}

      {workloadReferencesExists() &&
        props.workloadReferences.map((reference, wRef) => {
          return (
            <List style={{ padding: 0 }}>
              <ListItem key={wRef} style={{ padding: 0 }}>
                {renderWorkloadItem(reference.namespace, reference.name)}
              </ListItem>
            </List>
          );
        })}

      {objectReferencesExists() &&
        props.objectReferences.map((reference, oRef) => {
          return (
            <List style={{ padding: 0 }}>
              <ListItem key={oRef} style={{ padding: 0 }}>
                {renderIstioObjectItem(
                  reference.namespace,
                  reference.name,
                  reference.objectGVK,
                )}
              </ListItem>
            </List>
          );
        })}
    </>
  );
};

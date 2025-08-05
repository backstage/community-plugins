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
import { Breadcrumbs } from '@material-ui/core';
import { Location, useLocation } from 'react-router-dom';
import { HistoryManager } from '../../app/History';
import { Paths } from '../../config';
import { kialiStyle } from '../../styles/StyleUtils';
import { BackstageObjectLink } from '../../utils/backstageLinks';
import { kindToStringIncludeK8s } from '../../utils/IstioConfigUtils';
import { FilterSelected } from '../Filters/StatefulFilters';

const ItemNames = {
  applications: 'App',
  services: 'Service',
  workloads: 'Workload',
  istio: 'Istio Object',
};

const IstioName = 'Istio Config';
const namespaceRegex =
  /kiali\/([a-z0-9-]+)\/([\w-.]+)\/([\w-.*]+)(\/([\w-.]+))?(\/([\w-.]+))?/;

export const getPath = (props: Location) => {
  const match = namespaceRegex.exec(props.pathname) || [];
  const ns = match[2];
  // @ts-ignore
  const page = Paths[match[1]?.toLocaleUpperCase('en-US')];
  const istioType = match[3];
  const urlParams = new URLSearchParams(props.search);
  const itemName = page !== 'istio' ? match[3] : match[5];
  return {
    cluster: HistoryManager.getClusterName(urlParams),
    istioType: istioType,
    item: itemName,
    // @ts-ignore
    itemName: ItemNames[page],
    namespace: ns,
    pathItem: page,
  };
};

const breadcrumStyle = kialiStyle({
  marginBottom: '20px',
  marginTop: '-20px',
});

export const BreadcrumbView = (props: { entity?: boolean }) => {
  const capitalize = (str: string) => {
    return str?.charAt(0)?.toLocaleUpperCase('en-US') + str?.slice(1);
  };

  const path = getPath(useLocation());

  const cleanFilters = () => {
    FilterSelected.resetFilters();
  };

  const isIstioF = () => {
    return path?.pathItem === 'istio';
  };

  const namespace = path ? path.namespace : '';
  const item = path ? path.item : '';
  const istioType = path ? kindToStringIncludeK8s(path.istioType) : '';
  const pathItem = path ? path.pathItem : '';

  const isIstio = isIstioF();

  const tab = `tabresources=${pathItem}`;
  const filterNs = `namespaces=${namespace}`;

  return (
    <div className={breadcrumStyle}>
      <Breadcrumbs style={{ fontSize: '14px' }}>
        <BackstageObjectLink
          root
          entity={props.entity}
          onClick={cleanFilters}
          query={props.entity ? `${tab}` : ''}
          type={pathItem}
        >
          {isIstio ? IstioName : capitalize(pathItem)}
        </BackstageObjectLink>
        <BackstageObjectLink
          root
          entity={props.entity}
          query={props.entity ? `${tab}&${filterNs}` : filterNs}
          onClick={cleanFilters}
          type={pathItem}
        >
          Namespace: {namespace}
        </BackstageObjectLink>
        {isIstio && (
          <BackstageObjectLink
            root
            entity={props.entity}
            query={`${filterNs}&type=${
              // @ts-ignore
              kindToStringIncludeK8s('', istioType)
            }`}
            onClick={cleanFilters}
            type="istio"
          >
            {istioType}
          </BackstageObjectLink>
        )}
        <>{item}</>
      </Breadcrumbs>
    </div>
  );
};

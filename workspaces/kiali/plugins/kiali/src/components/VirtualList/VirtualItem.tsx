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
  hasHealth,
  Health,
} from '@backstage-community/plugin-kiali-common/func';
import type { IstioConfigItem } from '@backstage-community/plugin-kiali-common/types';
import { TableRow } from '@material-ui/core';
import { CSSProperties, default as React } from 'react';
import { useLinkStyle } from '../../styles/StyleUtils';
import {
  getGVKTypeString,
  getIstioObjectGVK,
} from '../../utils/IstioConfigUtils';
import { StatefulFiltersProps } from '../Filters/StatefulFilters';
import { PFBadgeType } from '../Pf/PfBadges';
import { GVKToBadge, RenderResource, Resource } from './Config';
import { actionRenderer } from './Renderers';

type VirtualItemProps = {
  action?: JSX.Element;
  className?: string;
  columns: any[];
  config: Resource;
  index: number;
  item: RenderResource; // Add 'type' property to 'RenderResource' type
  key: string;
  statefulFilterProps?: StatefulFiltersProps;
  style?: CSSProperties;
  view?: string;
};

export const VirtualItem = (props: VirtualItemProps) => {
  const [itemState, setItemState] = React.useState<Health>();

  React.useEffect(() => {
    if (hasHealth(props.item)) {
      if ('health' in props.item) {
        setItemState(props.item.health);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemState]);

  const getBadge = (): React.ReactNode | PFBadgeType => {
    if (props.config.name !== 'istio') {
      return props.config.badge;
    }
    return GVKToBadge[
      getGVKTypeString(
        getIstioObjectGVK(
          (props.item as IstioConfigItem).apiVersion,
          (props.item as IstioConfigItem).kind,
        ),
      )
    ];
  };

  const linkColor = useLinkStyle();

  const renderDetails = (
    item: RenderResource & { type?: string }, // Add 'type' property to 'RenderResource' type
    health?: Health,
  ): React.ReactNode => {
    return props.columns
      .filter(object => !!object.renderer)
      .map(object =>
        object.renderer(
          item,
          props.config,
          getBadge(),
          health,
          props.statefulFilterProps,
          props.view,
          linkColor,
        ),
      );
  };

  const { style, className, item } = props;
  const cluster = item.cluster ? `_Cluster${item.cluster}` : '';
  const namespace = 'namespace' in item ? `_Ns${item.namespace}` : '';
  const type = 'type' in item ? `_${item.type}` : '';
  // End result looks like: VirtualItem_Clusterwest_Nsbookinfo_gateway_bookinfo-gateway

  const key = `VirtualItem${cluster}${namespace}${type}_${item.name}`;

  return (
    <TableRow
      style={style}
      className={className}
      role="row"
      key={key}
      data-test={key}
    >
      {renderDetails(item, itemState)}
      {props.action && actionRenderer(key, props.action)}
    </TableRow>
  );
};

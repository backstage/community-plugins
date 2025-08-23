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
import { GroupVersionKind } from '@backstage-community/plugin-kiali-common/types';
import { Tooltip } from '@material-ui/core';
import { default as React } from 'react';
import { KialiIcon } from '../../config';
import { kialiStyle } from '../../styles/StyleUtils';
import { BackstageObjectLink } from '../../utils/backstageLinks';
import { getGVKTypeString } from '../../utils/IstioConfigUtils';
import { PFBadge } from '../Pf/PfBadges';
import { GVKToBadge } from '../VirtualList/Config';

type ReferenceIstioObjectProps = {
  cluster?: string;
  name: string;
  namespace: string;
  query?: string;
  subType?: string;
  objectGVK: GroupVersionKind;
};

type IstioObjectProps = ReferenceIstioObjectProps & {
  children: React.ReactNode;
};

export const IstioObjectLink: React.FC<IstioObjectProps> = (
  props: IstioObjectProps,
) => {
  const { name, namespace, objectGVK, cluster, query } = props;
  return (
    <BackstageObjectLink
      name={name}
      namespace={namespace}
      type="istio"
      objectGVK={objectGVK}
      cluster={cluster}
      query={query}
      data-test={`${objectGVK}-${namespace}-${name}`}
    >
      {props.children}
    </BackstageObjectLink>
  );
};

export const ReferenceIstioObjectLink = (props: ReferenceIstioObjectProps) => {
  const { name, namespace, cluster, objectGVK, subType } = props;
  const istioType = objectGVK;

  let showLink = true;
  let showTooltip = false;
  let tooltipMsg: string | undefined = undefined;
  let reference = `${namespace}/${name}`;

  const infoStyle = kialiStyle({
    marginLeft: '0.5rem',
    verticalAlign: '-0.06em !important',
  });

  if (name === 'mesh') {
    reference = name;
    showLink = false;
    showTooltip = true;
    tooltipMsg =
      'The reserved word, "mesh", implies all of the sidecars in the mesh';
  }
  const badge = GVKToBadge[getGVKTypeString(istioType as GroupVersionKind)];
  return (
    <>
      <PFBadge badge={badge} />

      {showLink && (
        <IstioObjectLink
          name={name}
          namespace={namespace}
          cluster={cluster}
          objectGVK={objectGVK}
          subType={subType}
        >
          {reference}
        </IstioObjectLink>
      )}

      {!showLink && <div style={{ display: 'inline-block' }}>{reference}</div>}

      {showTooltip && (
        <Tooltip title={<div style={{ textAlign: 'left' }}>{tooltipMsg}</div>}>
          <KialiIcon.Info className={infoStyle} />
        </Tooltip>
      )}
    </>
  );
};

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
} from '@backstage-community/plugin-kiali-common/types';
import { List, ListItem, Typography } from '@material-ui/core';
import { default as React } from 'react';
import { ReferenceIstioObjectLink } from '../../components/Link/IstioObjectLink';
import { PFBadge } from '../../components/Pf/PfBadges';
import { GVKToBadge } from '../../components/VirtualList/Config';
import { getGVKTypeString } from '../../utils/IstioConfigUtils';

interface IstioConfigReferencesProps {
  objectReferences: ObjectReference[];
  cluster?: string;
  view?: string;
}

export const IstioConfigValidationReferences = (
  props: IstioConfigReferencesProps,
) => {
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
        Validation References
      </Typography>
      <List style={{ padding: 0 }}>
        {props.objectReferences &&
          props.objectReferences.map((reference, i) => {
            return (
              <ListItem style={{ padding: 0 }} key={i}>
                {renderIstioObjectItem(
                  reference.namespace,
                  reference.name,
                  reference.objectGVK,
                )}
              </ListItem>
            );
          })}
      </List>
    </>
  );
};

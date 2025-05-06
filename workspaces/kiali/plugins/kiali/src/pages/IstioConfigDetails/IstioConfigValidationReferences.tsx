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
import { ObjectReference } from '@backstage-community/plugin-kiali-common/types';
import { List, ListItem, Typography } from '@material-ui/core';
import { ReferenceIstioObjectLink } from '../../components/Link/IstioObjectLink';

interface IstioConfigReferencesProps {
  objectReferences: ObjectReference[];
  cluster?: string;
}

export const IstioConfigValidationReferences = (
  props: IstioConfigReferencesProps,
) => {
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
                <ReferenceIstioObjectLink
                  name={reference.name}
                  namespace={reference.namespace}
                  cluster={props.cluster}
                  objectGVK={reference.objectGVK}
                />
              </ListItem>
            );
          })}
      </List>
    </>
  );
};

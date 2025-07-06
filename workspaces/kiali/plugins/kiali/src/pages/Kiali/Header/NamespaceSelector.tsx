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
  Checkbox,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@material-ui/core';
import { default as React } from 'react';
import { NamespaceActions } from '../../../actions';
import { KialiAppState, KialiContext } from '../../../store';

export const NamespaceSelector = (props: { page?: boolean }) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event;
    kialiState.dispatch.namespaceDispatch(
      NamespaceActions.setActiveNamespaces(
        (
          kialiState.namespaces.items?.filter(
            ns => ns.cluster === kialiState.providers.activeProvider,
          ) || []
        ).filter(ns => (value as string[]).includes(ns.name)),
      ),
    );
  };
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  return (
    <div
      style={{
        height: '50px',
        width: '200px',
        marginTop: props.page ? '20px' : '0px',
        color: 'white',
      }}
    >
      <InputLabel
        id="demo-multiple-checkbox-label"
        style={{ color: props.page ? 'white' : undefined }}
      >
        Namespaces Selected
      </InputLabel>
      <Select
        value={kialiState.namespaces.activeNamespaces.map(ns => ns.name)}
        multiple
        onChange={handleChange}
        renderValue={selected => (selected as string[]).join(', ')}
        MenuProps={MenuProps}
        data-test="namespace-selector"
        style={{ color: 'white' }}
      >
        {(kialiState.namespaces.items || []).map(ns => (
          <MenuItem key={ns.name} value={ns.name}>
            <Checkbox
              checked={
                kialiState.namespaces.activeNamespaces
                  .map(activeNs => activeNs.name)
                  .indexOf(ns.name) > -1
              }
            />
            <ListItemText primary={ns.name} />
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

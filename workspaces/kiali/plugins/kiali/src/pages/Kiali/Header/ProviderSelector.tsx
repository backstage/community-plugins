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
import { KIALI_PROVIDER } from '@backstage-community/plugin-kiali-common';
import { useApi } from '@backstage/core-plugin-api';
import { InputLabel, MenuItem, Select } from '@material-ui/core';
import { default as React } from 'react';
import { NamespaceActions } from '../../../actions';
import { ProviderActions } from '../../../actions/ProviderAction';
import { kialiApiRef } from '../../../services/Api';
import { KialiAppState, KialiContext } from '../../../store';

export const ProviderSelector = (props: { page?: boolean }) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const kialiClient = useApi(kialiApiRef);
  const handleChange = async (event: any) => {
    const {
      target: { value },
    } = event;
    kialiState.dispatch.providerDispatch(
      ProviderActions.setActiveProvider(value as string),
    );
    kialiClient.setAnnotation(KIALI_PROVIDER, value as string);
    await kialiClient
      .getNamespaces()
      .then(data => {
        kialiState.dispatch.namespaceDispatch(
          NamespaceActions.receiveList(
            [...data.filter(ns => ns.cluster === (value as string))],
            new Date(),
          ),
        );
        kialiState.dispatch.namespaceDispatch(
          NamespaceActions.setActiveNamespaces([
            ...data.filter(ns => ns.cluster === (value as string)),
          ]),
        );
      })
      .catch(_ => {
        kialiState.dispatch.namespaceDispatch(
          NamespaceActions.receiveList([], new Date()),
        );
        kialiState.dispatch.namespaceDispatch(
          NamespaceActions.setActiveNamespaces([]),
        );
      });
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
        marginTop: props.page ? '20px' : '0px',
        color: 'white',
      }}
    >
      <InputLabel
        id="demo-multiple-checkbox-label"
        style={{ color: props.page ? 'white' : undefined }}
      >
        Provider:
      </InputLabel>
      <Select
        value={kialiState.providers.activeProvider}
        onChange={handleChange}
        MenuProps={MenuProps}
        data-test="provider-selector"
        style={{ color: 'white' }}
      >
        {(kialiState.providers.items || []).map(prov => (
          <MenuItem key={prov} value={prov}>
            {prov}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

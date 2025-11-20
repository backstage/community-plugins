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
import { useHeaderBackground } from '../../../contexts/HeaderBackgroundContext';
import { KialiAppState, KialiContext } from '../../../store';

export const NamespaceSelector = (props: { page?: boolean }) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const hasBackgroundImage = useHeaderBackground();

  const allNamespaces = kialiState.namespaces.items || [];
  const activeNamespaceNames = kialiState.namespaces.activeNamespaces.map(
    ns => ns.name,
  );
  const allSelected =
    allNamespaces.length > 0 &&
    allNamespaces.every(ns => activeNamespaceNames.includes(ns.name));

  const SELECT_ALL_VALUE = '__SELECT_ALL__';

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event;
    const values = value as string[];

    // Check if "Select All" option was clicked by checking if SELECT_ALL_VALUE is in the array
    if (values.includes(SELECT_ALL_VALUE)) {
      if (allSelected) {
        // Deselect all
        kialiState.dispatch.namespaceDispatch(
          NamespaceActions.setActiveNamespaces([]),
        );
      } else {
        // Select all
        kialiState.dispatch.namespaceDispatch(
          NamespaceActions.setActiveNamespaces(allNamespaces),
        );
      }
      return;
    }

    // Filter out invalid values and SELECT_ALL_VALUE
    const validValues = values.filter(
      v =>
        v &&
        v !== '' &&
        v !== SELECT_ALL_VALUE &&
        allNamespaces.some(ns => ns.name === v),
    );
    kialiState.dispatch.namespaceDispatch(
      NamespaceActions.setActiveNamespaces(
        allNamespaces.filter(ns => validValues.includes(ns.name)),
      ),
    );
  };

  const handleSelectAllClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Update state directly
    if (allSelected) {
      kialiState.dispatch.namespaceDispatch(
        NamespaceActions.setActiveNamespaces([]),
      );
    } else {
      kialiState.dispatch.namespaceDispatch(
        NamespaceActions.setActiveNamespaces(allNamespaces),
      );
    }
  };

  const handleSelectAllMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Update state directly on mouse down as well
    if (allSelected) {
      kialiState.dispatch.namespaceDispatch(
        NamespaceActions.setActiveNamespaces([]),
      );
    } else {
      kialiState.dispatch.namespaceDispatch(
        NamespaceActions.setActiveNamespaces(allNamespaces),
      );
    }
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
  const textColor = hasBackgroundImage ? 'white' : undefined;

  return (
    <div
      style={{
        height: '50px',
        width: '200px',
        marginTop: props.page ? '20px' : '0px',
        color: textColor,
      }}
    >
      <InputLabel
        id="demo-multiple-checkbox-label"
        style={{ color: textColor }}
      >
        Namespaces Selected
      </InputLabel>
      <Select
        value={activeNamespaceNames.filter(v => v !== SELECT_ALL_VALUE)}
        multiple
        onChange={handleChange}
        renderValue={selected =>
          (selected as string[]).filter(v => v !== SELECT_ALL_VALUE).join(', ')
        }
        MenuProps={MenuProps}
        data-test="namespace-selector"
        style={{ maxWidth: '600px', minWidth: '200px', color: textColor }}
      >
        {allNamespaces.length > 0 && (
          <MenuItem
            key="select-all"
            value={SELECT_ALL_VALUE}
            onClick={handleSelectAllClick}
            onMouseDown={handleSelectAllMouseDown}
            style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
          >
            <Checkbox checked={allSelected} indeterminate={false} />
            <ListItemText
              primary={allSelected ? 'Deselect All' : 'Select All'}
            />
          </MenuItem>
        )}
        {allNamespaces.map(ns => (
          <MenuItem key={ns.name} value={ns.name}>
            <Checkbox checked={activeNamespaceNames.includes(ns.name)} />
            <ListItemText primary={ns.name} />
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

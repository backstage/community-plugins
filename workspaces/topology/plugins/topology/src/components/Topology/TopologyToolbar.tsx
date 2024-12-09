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
import React from 'react';

import { ToolbarItem } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

import { FilterContext } from '../../hooks/FilterContext';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import { TopologyDisplayOption } from '../../types/types';

type TopologyToolbarProps = {
  showFilters: boolean;
};

const TopologyToolbar = ({ showFilters }: TopologyToolbarProps) => {
  const { clusters: k8sClusters, setSelectedCluster: setClusterContext } =
    React.useContext(K8sResourcesContext);

  const { filters, setAppliedTopologyFilters } =
    React.useContext(FilterContext);
  const clusterOptions = k8sClusters.map(cluster => ({
    value: cluster,
    disabled: false,
  }));
  const [clusterFilterIsExpanded, setClusterFilterIsExpanded] =
    React.useState<boolean>(false);
  const [displayOptionsIsExpanded, setDisplayOptionsIsExpanded] =
    React.useState<boolean>(false);

  const [clusterSelected, setClusterSelected] = React.useState<
    string | SelectOptionObject
  >();

  const onClusterFilterToggle = (isClusterFilterExpanded: boolean) => {
    setClusterFilterIsExpanded(isClusterFilterExpanded);
  };

  const onDisplayOptionsToggle = (isDisplayOptionsExpanded: boolean) => {
    setDisplayOptionsIsExpanded(isDisplayOptionsExpanded);
  };

  const onClusterChange = (
    _e: React.ChangeEvent | React.MouseEvent,
    selection: string | SelectOptionObject,
  ) => {
    const index = k8sClusters.findIndex(cluster => cluster === selection);
    setClusterContext(index);
    setClusterSelected(selection);
    setClusterFilterIsExpanded(false);
  };

  const onDisplayOptionChange = (
    e: React.ChangeEvent | React.MouseEvent,
    selection: string | SelectOptionObject,
  ) => {
    if (filters && filters.length !== 0) {
      const index = filters?.findIndex(f => f.id === selection);

      if (index !== undefined && index > -1) {
        const filter = {
          ...filters[index],
          value: (e.target as HTMLInputElement).checked,
        };
        setAppliedTopologyFilters?.([
          ...filters.slice(0, index),
          filter,
          ...filters.slice(index + 1),
        ] as TopologyDisplayOption[]);
      }
    }
  };

  return (
    <>
      <ToolbarItem variant="label" id="cluster-filter">
        Cluster
      </ToolbarItem>
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          aria-label="Select Cluster"
          onToggle={(_event, isClusterFilterExpanded: boolean) =>
            onClusterFilterToggle(isClusterFilterExpanded)
          }
          onSelect={onClusterChange}
          selections={clusterSelected}
          isOpen={clusterFilterIsExpanded}
          aria-labelledby="select-cluster"
        >
          {clusterOptions.map((option, index) => (
            <SelectOption
              isDisabled={option.disabled}
              key={index}
              value={option.value}
            />
          ))}
        </Select>
      </ToolbarItem>
      {showFilters && (
        <Select
          variant={SelectVariant.checkbox}
          aria-label="Display options"
          onToggle={(_event, isDisplayOptionsExpanded: boolean) =>
            onDisplayOptionsToggle(isDisplayOptionsExpanded)
          }
          onSelect={(event, value) => onDisplayOptionChange(event, value)}
          isOpen={displayOptionsIsExpanded}
          aria-labelledby="display-options"
          placeholderText="Display options"
          customContent={filters?.map((filter, _) => (
            <SelectOption
              key={filter.id}
              value={filter.id}
              isChecked={filter.value}
            >
              {filter.label}
            </SelectOption>
          ))}
        />
      )}
    </>
  );
};

export default TopologyToolbar;

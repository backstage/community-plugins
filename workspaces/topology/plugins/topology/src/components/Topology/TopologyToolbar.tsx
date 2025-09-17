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
import type { MouseEvent, Ref } from 'react';

import { useContext, useState } from 'react';

import { LabelGroup, ToolbarItem, Label } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';

import { FilterContext } from '../../hooks/FilterContext';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';

type TopologyToolbarProps = {
  showFilters: boolean;
};

const TopologyToolbar = ({ showFilters }: TopologyToolbarProps) => {
  const { clusters: k8sClusters, setSelectedCluster: setClusterContext } =
    useContext(K8sResourcesContext);

  const { filters, setAppliedTopologyFilters } = useContext(FilterContext);
  const clusterOptions = k8sClusters.map(cluster => ({
    value: cluster,
    disabled: false,
  }));
  const [clusterFilterIsExpanded, setClusterFilterIsExpanded] =
    useState<boolean>(false);
  const [displayOptionsIsExpanded, setDisplayOptionsIsExpanded] =
    useState<boolean>(false);

  const [clusterSelected, setClusterSelected] = useState<
    string | number | undefined
  >();

  const onClusterFilterToggle = (isClusterFilterExpanded: boolean) => {
    setClusterFilterIsExpanded(isClusterFilterExpanded);
  };

  const onDisplayOptionsToggle = (isDisplayOptionsExpanded: boolean) => {
    setDisplayOptionsIsExpanded(isDisplayOptionsExpanded);
  };

  const onClusterChange = (
    _e: MouseEvent | undefined,
    selection: string | number | undefined,
  ) => {
    const index = k8sClusters.findIndex(cluster => cluster === selection);
    setClusterContext(index);
    setClusterSelected(selection);
    setClusterFilterIsExpanded(false);
  };

  const onDisplayOptionChange = (
    e: MouseEvent | undefined,
    selection: string | number | undefined,
  ) => {
    if (filters && filters.length !== 0 && selection && e) {
      const index = filters.findIndex(filter => filter.value === selection);
      const newFilters = [...filters];
      newFilters[index] = {
        ...newFilters[index],
        isSelected: !newFilters[index].isSelected,
      };
      setAppliedTopologyFilters?.(newFilters);
    }
  };

  return (
    <>
      <ToolbarItem variant="label" id="cluster-filter">
        Cluster
      </ToolbarItem>
      <ToolbarItem>
        <Select
          aria-label="Select Cluster"
          onOpenChange={onClusterFilterToggle}
          onSelect={onClusterChange}
          isOpen={clusterFilterIsExpanded}
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              isExpanded={clusterFilterIsExpanded}
              onClick={() => onClusterFilterToggle(!clusterFilterIsExpanded)}
            >
              {clusterSelected || 'Select Cluster'}
            </MenuToggle>
          )}
        >
          <SelectList>
            {clusterOptions.map(option => (
              <SelectOption
                key={option.value}
                isSelected={option.value === clusterSelected}
                value={option.value}
              >
                {option.value}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </ToolbarItem>
      {showFilters && (
        <ToolbarItem>
          <Select
            aria-label="Display options"
            onOpenChange={onDisplayOptionsToggle}
            onSelect={(event, value) => onDisplayOptionChange(event, value)}
            isOpen={displayOptionsIsExpanded}
            toggle={(toggleRef: Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                isExpanded={displayOptionsIsExpanded}
                onClick={() =>
                  onDisplayOptionsToggle(!displayOptionsIsExpanded)
                }
              >
                {(filters ?? []).filter(f => f?.isSelected)?.length > 0 ? (
                  <LabelGroup aria-label="Current display options">
                    {filters?.map(
                      filter =>
                        filter.isSelected && (
                          <Label key={filter.value} isCompact variant="outline">
                            {filter.content}
                          </Label>
                        ),
                    )}
                  </LabelGroup>
                ) : (
                  'Display options'
                )}
              </MenuToggle>
            )}
          >
            <SelectList>
              {filters?.map(filter => (
                <SelectOption
                  hasCheckbox
                  key={filter.value}
                  value={filter.value}
                  isDisabled={filter.isDisabled}
                  isSelected={filter.isSelected}
                >
                  {filter.content}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </ToolbarItem>
      )}
    </>
  );
};

export default TopologyToolbar;

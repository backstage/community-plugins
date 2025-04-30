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
import type { ReactNode, SetStateAction, Dispatch } from 'react';

import { useState, useMemo, useCallback } from 'react';

import { BaseNode } from '@patternfly/react-topology';

import TopologySideBar from '../components/Topology/TopologySideBar/TopologySideBar';
import { TYPE_VM, TYPE_WORKLOAD } from '../const';

export const useSideBar = (): [
  ReactNode,
  boolean,
  string,
  Dispatch<SetStateAction<boolean>>,
  Dispatch<SetStateAction<BaseNode | null>>,
  () => void,
] => {
  const { search } = window.location;
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null);

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const selectedId = params.get('selectedId') ?? '';

  const removeSelectedIdParam = useCallback(() => {
    params.delete('selectedId');
    const url = new URL(window.location.href);
    history.replaceState(
      null,
      '',
      `${url.pathname}${params.toString()}${url.hash}`,
    );
  }, [params]);

  const sideBar = selectedNode &&
    (selectedNode.getType() === TYPE_WORKLOAD ||
      selectedNode.getType() === TYPE_VM) && (
      <TopologySideBar
        onClose={() => {
          setSideBarOpen(false);
          removeSelectedIdParam();
        }}
        node={selectedNode}
      />
    );

  return [
    sideBar,
    sideBarOpen,
    selectedId,
    setSideBarOpen,
    setSelectedNode,
    removeSelectedIdParam,
  ];
};

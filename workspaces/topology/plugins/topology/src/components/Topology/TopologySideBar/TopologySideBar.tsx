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
  BaseNode,
  TopologySideBar as PFTopologySideBar,
} from '@patternfly/react-topology';

import TopologySideBarContent from './TopologySideBarContent';

import './TopologySideBar.css';

type TopologySideBarProps = {
  node: BaseNode;
  onClose: () => void;
};

const TopologySideBar = ({ onClose, node }: TopologySideBarProps) => {
  return (
    <PFTopologySideBar resizable onClose={onClose}>
      <div className="pf-topology-side-bar__body">
        <TopologySideBarContent node={node} />
      </div>
    </PFTopologySideBar>
  );
};

export default TopologySideBar;
